const { polarityRequest } = require('./polarity-request');
const { getLogger } = require('./logger');
const { get } = require('lodash/fp');
const _ = require('lodash');

let ipBlocklistRegex = null;
let domainUrlBlocklistRegex = null;

function _isIpBlocked(entity, options) {
  const Logger = getLogger();
  const blocklist = options.blocklist;
  const currentIpBlocklistRegex = options.ipBlocklistRegex;

  if (currentIpBlocklistRegex !== null && currentIpBlocklistRegex.length > 0) {
    // If currentIpBlocklistRegex is not empty and not null, update ipBlocklistRegex
    if (
      ipBlocklistRegex === null ||
      ipBlocklistRegex.source !== currentIpBlocklistRegex
    ) {
      Logger.trace('Initializing/Updating ipBlocklistRegex');
      ipBlocklistRegex = new RegExp(currentIpBlocklistRegex);
    }
  } else {
    // If currentIpBlocklistRegex is empty or null, set ipBlocklistRegex to null
    ipBlocklistRegex = null;
  }

  if (blocklist.includes(entity.value.toLowerCase())) {
    Logger.trace({ entity: entity.value }, 'Blocked Entity');
    return true;
  }

  if (
    entity.isIP &&
    !entity.isPrivateIP &&
    ipBlocklistRegex !== null &&
    ipBlocklistRegex.test(entity.value)
  ) {
    Logger.debug({ ip: entity.value }, 'IP lookup blocked due to blocklist regex');
    return true;
  }

  return false;
}

function _isDomainBlocked(entity, options) {
  const Logger = getLogger();
  const blocklist = options.blocklist;
  const currentDomainUrlBlocklistRegex = options.domainUrlBlocklistRegex;

  if (
    currentDomainUrlBlocklistRegex !== null &&
    currentDomainUrlBlocklistRegex.length > 0
  ) {
    // If currentDomainUrlBlocklistRegex is not empty and not null, update ipBlocklistRegex
    if (
      domainUrlBlocklistRegex === null ||
      domainUrlBlocklistRegex.source !== currentDomainUrlBlocklistRegex
    ) {
      Logger.trace('Initializing/Updating domainUrlBlocklistRegex');
      domainUrlBlocklistRegex = new RegExp(currentDomainUrlBlocklistRegex);
    }
  } else {
    // If currentdomainUrlBlocklistRegex is empty or null, set domainUrlBlocklistRegex to null
    domainUrlBlocklistRegex = null;
  }

  if (blocklist.includes(entity.value.toLowerCase())) {
    Logger.trace({ entity: entity.value }, 'Blocked Entity');
    return true;
  }

  if (
    entity.isDomain &&
    domainUrlBlocklistRegex !== null &&
    domainUrlBlocklistRegex.test(entity.value)
  ) {
    Logger.debug({ ip: entity.value }, 'IP lookup blocked due to blocklist regex');
    return true;
  }

  if (entity.isURL) {
    if (domainUrlBlocklistRegex !== null) {
      const urlObj = new URL(entity.value);
      const hostname = urlObj.hostname;
      Logger.debug(hostname, 'Hostname of url to block');
      if (domainUrlBlocklistRegex.test(hostname)) {
        Logger.debug({ url: entity.value }, 'URL lookup blocked due to blocklist regex');
        return true;
      }
    }
  }

  return false;
}

async function searchType(entities) {
  const Logger = getLogger();

  const transformedEntities = mapEntityType(entities);
  Logger.trace({ transformedEntities }, 'transformedEntities');
  const entitiesWithSource = findMatchingSources(transformedEntities);
  Logger.trace({ entitiesWithSource }, 'entitiesWithSource');

  // All entities were filtered out by blocklists
  if (entitiesWithSource.length === 0) {
    return [];
  }

  const requestOptions = _.chain(entitiesWithSource)
    .filter((obj) => obj && obj.dataSource)
    .map((obj) => ({
      entity: obj.entity,
      method: 'GET',
      path: `/api/v1/Lookup/${obj.dataSource}/?argument=${obj.entity.value}`
    }))
    .value();

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

const ENTITY_TYPE_TO_DATASOURCES = {
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

  return entities.reduce((acc, entity) => {
    if (
      !_isIpBlocked(entity, polarityRequest.options) &&
      !_isDomainBlocked(entity, polarityRequest.options)
    ) {
      const datasourcesForEntityType = ENTITY_TYPE_TO_DATASOURCES[entity.transformedType];
      dataSources.forEach((dataSource) => {
        if (datasourcesForEntityType.includes(dataSource)) {
          acc.push({
            entity,
            dataSource
          });
        }
      });
    }
    return acc;
  }, []);
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
