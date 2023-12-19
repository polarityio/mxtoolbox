const { polarityRequest } = require('./polarity-request');
const { getLogger } = require('./logger');
const { get } = require('lodash/fp');
const _ = require('lodash');

function _isEntityBlocked(entity, options) {
  const ipBlocklistRegex = options.ipBlocklistRegex
    ? new RegExp(options.ipBlocklistRegex)
    : null;

  const domainUrlBlocklistRegex = options.domainUrlBlocklistRegex
    ? new RegExp(options.domainUrlBlocklistRegex)
    : null;

  if (
    entity.isIP &&
    !entity.isPrivateIP &&
    ipBlocklistRegex &&
    ipBlocklistRegex.test(entity.value)
  ) {
    return true;
  }

  if (
    entity.isDomain &&
    domainUrlBlocklistRegex &&
    domainUrlBlocklistRegex.test(entity.value)
  ) {
    return true;
  }

  if (entity.isURL && domainUrlBlocklistRegex) {
    const urlObj = new URL(entity.value);
    const hostname = urlObj.hostname;
    if (domainUrlBlocklistRegex.test(hostname)) {
      return true;
    }
  }

  return false;
}

async function searchType(entities) {
  const Logger = getLogger();

  const transformedEntities = mapEntityType(entities);
  const entitiesWithSource = findMatchingSources(transformedEntities);

  Logger.trace({ entitiesWithSource }, 'entitiesWithSource');

  const requestOptions = entitiesWithSource
    .filter((obj) => obj.dataSource)
    .map((obj) => ({
      entity: obj.entity,
      method: 'GET',
      path: `/api/v1/Lookup/${obj.dataSource}/?argument=${obj.entity.value}`
    }));

  Logger.trace({ requestOptions }, 'requestOptions here');
  const response = await polarityRequest.send(requestOptions);
  /* 
    This is a hack to remove null values from the response array
    this is because there are multiple requests being made, and the integration
    shouldn't throw an error if one of the requests fails, so it resolves with null and
    we need to filter those out
  */
  const filteredResponse = response.filter((obj) => obj != null);
  Logger.trace({ filteredResponse }, 'get response');

  const results = mergeResults(filteredResponse);
  Logger.trace({ results }, 'results');

  return results;
}

const ENTITY_TYPE_MAP = {
  domain: 'domain',
  IPv4: 'ip',
  IPv6: 'ip',
  url: 'url'
};

const ENTITY_TYPES = {
  domain: ['mx', 'blacklist'],
  ip: ['blacklist', 'http', 'https'],
  url: ['http', 'https']
};

function findMatchingSources(entities) {
  const Logger = getLogger();
  Logger.trace({ entities }, 'findMatchingSources');
  let dataSources = polarityRequest.options.dataSources.map(get('value'));

  // Define all types
  let types = ['mx', 'blacklist', 'http', 'https'];

  // If dataSources is empty, use all types
  if (dataSources.length === 0) {
    dataSources = types;
  }

  return entities.flatMap((entity) => {
    if (_isEntityBlocked(entity, polarityRequest.options)) {
      return types.map((type) => ({
        entity,
        dataSource: ENTITY_TYPES[entity.transformedType].includes(type) ? type : null
      }));
    }
  });
}

function mapEntityType(entities) {
  return entities.map((entity) => ({
    ...entity,
    transformedType: ENTITY_TYPE_MAP[entity.type] || 'domain'
  }));
}

function mergeResults(mockData) {
  return mockData.reduce((mergedData, data) => {
    const Logger = getLogger();
    const command = data.result.body.Command;

    const existingData = mergedData.find(
      (merged) => merged.entity.value === data.entity.value
    );

    if (existingData) {
      existingData[command] = data.result.body;
    } else {
      mergedData.push({
        entity: data.entity,
        [command]: data.result.body
      });
    }

    return mergedData;
  }, []);
}

module.exports = { searchType };
