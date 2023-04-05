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

  createResultsObject(apiResponse, summary = null) {
    const Logger = getLogger();
    Logger.trace({ apiResponse }, 'createResultObject arguments');

    return {
      entity: apiResponse.entity,
      data: {
        summary,
        details: apiResponse.result.body
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

module.exports = { PolarityResult };
