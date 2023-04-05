'use strict';
const { map } = require('lodash/fp');

const { setLogger, getLogger } = require('./src/logger');
const { polarityRequest } = require('./src/polarity-request');
const { parseErrorToReadableJSON } = require('./src/errors');
const { PolarityResult } = require('./src/create-result-object');
const { searchType } = require('./src/search-type');

let Logger = null;

const startup = (logger) => {
  Logger = logger;
  setLogger(Logger);
};
/**
 * @param entities
 * @param options
 * @param cb
 * @returns {Promise<void>}
 */
async function doLookup(entities, options, cb) {
  const Logger = getLogger();
  try {
    polarityRequest.setOptions(options);
    polarityRequest.setHeader({
      Authorization: options.apiKey
    });
    /*
     The mxtoolbox api requires that you pass in the lookups you want to do in the url.  
     This means that we have to make 4 separate calls to the api. So to limit the initial number of calls
     to the api, most of the functionality is done in the onMessage function. 
     However, there is an api call for a single type  in order to pre-populate the overlay.
    */
    const responses = await Promise.all(
      map(async (entity) => {
        const payload = {
          data: {
            entity: entity,
            type: 'mx' //mx is the default type right now, but maybe another search typed should be prioritized?
          }
        };
        const response = await searchType(payload);
        return response;
      }, entities)
    );

    Logger.trace({ responses }, 'responses');

    const lookupResults = map((response) => {
      const passedCount = response.result.body.Passed.length;
      const failedCount = response.result.body.Failed.length;
      const warningCount = response.result.body.Warnings.length;
      /*
        createResult object is taking the api response and a summary as a second parameter.
       */
      const result = new PolarityResult().createResultsObject(response, [
        `Failed: ${failedCount} Warnings: ${warningCount} Passed: ${passedCount}`
      ]);
      return result;
    }, responses);

    Logger.trace({ lookupResults }, 'lookupResults');
    return cb(null, lookupResults);
  } catch (err) {
    Logger.error(err);
    return cb(err);
  }
}

async function onMessage(payload, options, cb) {
  const Logger = getLogger();
  Logger.trace({ payload }, 'onMessage payload');
  try {
    switch (payload.action) {
      case 'SEARCH_TYPE':
        const response = await searchType(payload);
        Logger.trace({ response }, 'onMessage response');
        cb(null, response);
      default:
        cb('Unknown action');
    }
  } catch (err) {
    const error = parseErrorToReadableJSON(err);
    cb(error);
  }
}
module.exports = {
  startup,
  doLookup,
  onMessage
};

// Description of Integration:
// The MXToolbox is a tool that searches domains and provides MX information in priority order. There are four main Lookups that we need to do for the integration mx, blacklist, http and https. The API makes it so you have to pass through the lookups into the url so this will have to be 4 separate API calls.

// API Key is in 1pass

// Website: https://mxtoolbox.com

// API : https://api.mxtoolbox.com/api/v1/Lookup/{{lookupType}}/?argument={{entityID}}

// Summary Tags → We should have one summary tag that lists the following: Failed: {{count}}, Warnings: {{count}}, Passed: {{count}}. The Summary tag is a count of the number of failed, warnings and passed lookups. If there are counts of zero then we should not show the section of the tag. These should be a total count for all of the different lookups that occured

// LookupType Endpoints → mx, https, http, blacklist → These are the 4 endpoints that we need to query for the integration.

// Details → We should have a passed - failed and warning collapsable section that lists each of the objects with the data inside it.

// That is broken down for each of the different lookup types above:

// Example:

// MX :

// Passed → Data

// Failed → Data

// Warnings → Don't show no data
