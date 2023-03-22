'use strict';

const { map } = require('lodash/fp');

const { setLogger, getLogger } = require('./src/logger');
const { polarityRequest } = require('./src/polarity-request');
const { parseErrorToReadableJSON } = require('./src/errors');
const { PolarityResult } = require('./src/create-result-object');

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

async function doLookup(entities, options, cb) {}

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

// Warnings → Dont show no data

// Also include the following data: "MxRep": 98,
//   "EmailServiceProvider": null,
//   "DnsServiceProvider": null,
//   "DnsServiceProviderIdentifier": null,
