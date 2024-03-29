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

  polarityRequest.setOptions({ url: 'https://mxtoolbox.com', ...options });
  polarityRequest.setHeader({
    Authorization: options.apiKey
  });

  try {
    const responses = await searchType(entities);
    Logger.trace({ responses }, 'Search Responses');

    const lookupResults = map((response) => {
      return new PolarityResult().createResultsObject(response);
    }, responses);

    Logger.trace({ lookupResults }, 'lookupResults');
    return cb(null, lookupResults);
  } catch (err) {
    Logger.error(err);
    return cb(err);
  }
}

async function getQuota(payload) {
  const requestOptions = {
    entity: payload.data.entity,
    method: 'GET',
    path: '/api/v1/Usage'
  };
  try {
    const response = await polarityRequest.send(requestOptions);
    return response;
  } catch (err) {
    throw err;
  }
}

async function onMessage(payload, options, cb) {
  const Logger = getLogger();
  Logger.trace({ payload }, 'onMessage payload');
  try {
    switch (payload.action) {
      case 'GET_QUOTA':
        const quota = await getQuota(payload);
        Logger.trace({ quota }, 'quota');
        cb(null, quota);
        break;
      default:
        cb(null, 'UNKNOWN_ACTION');
    }
  } catch (err) {
    const error = parseErrorToReadableJSON(err);
    cb(error);
  }
}

function validateOptions(userOptions, cb) {
  const errors = [];

  if (
    typeof userOptions.apiKey.value !== 'string' ||
    (typeof userOptions.apiKey.value === 'string' &&
      userOptions.apiKey.value.length === 0)
  ) {
    errors.push({
      key: 'apiKey',
      message: 'You must provide an API Key'
    });
  }

  return cb(null, errors);
}

module.exports = {
  startup,
  doLookup,
  onMessage,
  validateOptions
};
