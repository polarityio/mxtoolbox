const { polarityRequest } = require('./polarity-request');
const { getLogger } = require('./logger');

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
  const dataSources = polarityRequest.options.dataSources;

  return entities.flatMap((entity) => {
    return dataSources.map((dataSource) => {
      const value = dataSource.value;
      if (
        ENTITY_TYPES[entity.transformedType].includes(value) &&
        polarityRequest.options.dataSources.includes(value)
      ) {
        return { entity, dataSource: value };
      }
      return { entity, dataSource: null };
    });
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
    const command = data.result.body.Command;
    const existingData = mergedData.find(
      (merged) => merged.entity.value === data.entity.value
    );

    Logger.trace({ existingData }, 'existingData');
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
