const { get } = require('lodash/fp');
const { getLogger } = require('./logger');

class PolarityResult {
  createEmptyBlock(entity) {
    return {
      entity: entity,
      data: {
        summary: [],
        details: []
      }
    };
  }

  createResultsObject(apiResponse) {
    const Logger = getLogger();
    Logger.trace({ apiResponse }, 'createResultObject arguments');

    return {
      entity: apiResponse.entity,
      data: {
        summary: createSummary(apiResponse),
        details: apiResponse
      }
    };
  }

  createNoResultsObject() {
    return {
      entity: this.entity,
      data: null
    };
  }
}

function createSummary(apiResponse) {
  const Logger = getLogger();
  Logger.trace({ apiResponse }, 'createSummary arguments');

  const passedCountTotal =
    (get('mx.Passed.length', apiResponse) || 0) +
    (get('blacklist.Passed.length', apiResponse) || 0) +
    (get('http.Passed.length', apiResponse) || 0) +
    (get('https.Passed.length', apiResponse) || 0);

  const failedCountTotal =
    (get('mx.Failed.length', apiResponse) || 0) +
    (get('blacklist.Failed.length', apiResponse) || 0) +
    (get('http.Failed.length', apiResponse) || 0) +
    (get('https.Failed.length', apiResponse) || 0);

  const warningCountTotal =
    (get('mx.Warnings.length', apiResponse) || 0) +
    (get('blacklist.Warnings.length', apiResponse) || 0) +
    (get('http.Warnings.length', apiResponse) || 0) +
    (get('https.Warnings.length', apiResponse) || 0);

  return [
    `Passed: ${passedCountTotal} ◾ Failed: ${failedCountTotal} ◾ Warnings: ${warningCountTotal}`
  ];
}

module.exports = { PolarityResult };
