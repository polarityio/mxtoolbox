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
        summary: this.createSummary(apiResponse),
        details: apiResponse.body
      }
    };
  }

  createNoResultsObject() {
    return {
      entity: this.entity,
      data: null
    };
  }

  createSummary(apiResponse) {
    const passedCount = apiResponse.body.Passed.length;
    const failedCount = apiResponse.body.Failed.length;
    const warningCount = apiResponse.body.Warnings.length;

    return [`Passed: ${passedCount} Failed: ${failedCount} Warnings: ${warningCount}`];
  }
}

module.exports = { PolarityResult };
