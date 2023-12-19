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
      entity: apiResponse[0].entity,
      data: {
        summary: [],
        details: apiResponse[0]
      }
    };
  }

  createNoResultsObject(entity) {
    return {
      entity,
      data: null
    };
  }
}

function createSummary(apiResponse) {
  const Logger = getLogger();
  Logger.trace({ apiResponse }, 'createSummary arguments');
}

module.exports = { PolarityResult };
