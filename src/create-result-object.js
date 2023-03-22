const { getLogger } = require('./logger');
/**
 * Return a Result Object or a Result Miss Object based on the REST API response.
 * @param null || {entity, result}
 * if I pass nothing in, I want it to return a result object with no data
 * if i pass in a single object, I want it to return a result object with data
 * either pass in a single object or an array of objects, being
 * @returns {{data: null, entity}|{data: {summary: [string], details}, entity}}
 */

class PolarityResult {
  createEmptyBlock (entity) {
    return {
      entity: entity,
      data: {
        summary: [],
        details: []
      }
    };
  }

  createResultsObject (apiResponse) {
    const Logger = getLogger();
    Logger.trace({ apiResponse }, 'createResultObject arguments');
    return {
      entity: createSummaryTags(apiResponse),
      data: {
        summary: [],
        details: apiResponse.result.body
      }
    };
  }

  createNoResultsObject () {
    return {
      entity: this.entity,
      data: null
    };
  }
}

// const createResultObject = (arguments) => {
//   const Logger = getLogger();
//   Logger.trace({ arguments }, 'createResultObject arguments');

//   const asdf = Object.keys(arguments).length;
//   Logger.trace({ asdf }, 'cASDASDASSDASs');

//   if (Object.keys(arguments).length >= 1) {
//     const { entity, result } = arguments;
//     Logger.trace({ entity, result }, 'createResultObject arguments');
//     return {
//       entity,
//       data: {
//         summary: [],
//         details: {
//           urls: result.body
//         }
//       }
//     };
//   } else {
//     return {
//       entity: arguments,
//       data: {
//         summary: [arguments.value],
//         details: []
//       }
//     };
//   }
// };

const createSummaryTags = (result) => {
  const tags = [];
  tags.push(`Category: ${result.body.configuredName}`);
  return tags;
};

module.exports = { PolarityResult };
