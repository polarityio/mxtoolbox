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
  Logger.trace({ response }, 'RESPONSE_HERE');
  /* 
    This is a hack to remove null values from the response array
    this is because there are multiple requests being made, and the integration
    shouldn't throw an error if one of the requests fails, so it resolves with null and
    we need to filter those out
  */
  const filteredResponse = response.filter((obj) => obj != null);
  Logger.trace({ filteredResponse }, 'get response');

  const results = mergeResults(filteredResponse);
  Logger.trace({ results }, 'MOCK_DATA');

  return results;
}

const ENTITY_TYPE_MAP = {
  domain: 'domain',
  IPv4: 'ip',
  IPv6: 'ip',
  url: 'url'
};

const ENTITY_TYPES = {
  domain: ['mx'],
  ip: ['blacklist', 'http', 'https'],
  url: ['http', 'https']
};

function findMatchingSources(entities) {
  const dataSources = polarityRequest.options.dataSources;

  return entities.flatMap((entity) => {
    return dataSources.map((dataSource) => {
      const value = dataSource.value;
      if (ENTITY_TYPES[entity.transformedType].includes(value)) {
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
      (merged) => merged.entity.rawValue === data.entity.rawValue
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

/*
  WILL REMOVE THIS BEFORE RELEASE
*/

// const mockData = [
//   {
//     entity: {
//       type: 'domain',
//       types: ['domain'],
//       isIP: false,
//       isIPv4: false,
//       isIPv6: false,
//       isPrivateIP: false,
//       IPType: '',
//       isHex: false,
//       isHash: false,
//       isMD5: false,
//       isSHA1: false,
//       isSHA256: false,
//       isSHA512: false,
//       hashType: '',
//       isGeo: false,
//       isEmail: false,
//       isURL: false,
//       isDomain: true,
//       isHTMLTag: false,
//       latitude: 0,
//       longitude: 0,
//       channels: [],
//       rawValue: 'google.com',
//       requestContext: {
//         isUserInitiated: true,
//         requestType: 'OnDemand'
//       },
//       value: 'google.com',
//       transformedType: 'domain'
//     },
//     result: {
//       statusCode: 200,
//       body: {
//         UID: null,
//         ArgumentType: 'domain',
//         Command: 'mx',
//         IsTransitioned: false,
//         CommandArgument: 'google.com',
//         TimeRecorded: '2023-04-23T15:05:21.4626502-05:00',
//         ReportingNameServer: 'ns4.google.com',
//         TimeToComplete: '98',
//         RelatedIP: null,
//         ResourceRecordType: 15,
//         IsEmptySubDomain: false,
//         IsEndpoint: false,
//         HasSubscriptions: false,
//         AlertgroupSubscriptionId: null,
//         Failed: [],
//         Warnings: [],
//         Passed: [
//           {
//             ID: 441,
//             Name: 'MX Record Published',
//             Info: 'MX Record found',
//             Url: 'https://mxtoolbox.com/Problem/mx/DMARC-Record-Published?page=prob_mx&showlogin=1&hidetoc=1&action=mx:google.com',
//             PublicDescription: null,
//             IsExcludedByUser: false
//           },
//           {
//             ID: 197,
//             Name: 'DMARC Policy Not Enabled',
//             Info: 'DMARC Quarantine/Reject policy enabled',
//             Url: 'https://mxtoolbox.com/Problem/mx/DMARC-Policy-Not-Enabled?page=prob_mx&showlogin=1&hidetoc=1&action=mx:google.com',
//             PublicDescription: null,
//             IsExcludedByUser: false
//           },
//           {
//             ID: 506,
//             Name: 'DNS Record Published',
//             Info: 'DNS Record found',
//             Url: 'https://mxtoolbox.com/Problem/mx/DNS-Record-Published?page=prob_mx&showlogin=1&hidetoc=1&action=mx:google.com',
//             PublicDescription: null,
//             IsExcludedByUser: false
//           }
//         ],
//         Timeouts: [],
//         Errors: [],
//         IsError: false,
//         Information: [
//           {
//             Pref: '10',
//             Hostname: 'smtp.google.com',
//             'IP Address': '142.251.111.27',
//             TTL: '5 min',
//             Asn: '[{"asname":"Google LLC", "asn":"15169"}]',
//             IsIpV6: 'False'
//           },
//           {
//             Pref: '10',
//             Hostname: 'smtp.google.com',
//             'IP Address': '2607:f8b0:4004:c19::1b',
//             TTL: '5 min',
//             Asn: '[]',
//             IsIpV6: 'True'
//           }
//         ],
//         MultiInformation: [],
//         Transcript: [
//           {
//             Transcript:
//               '- - - mx:google.com\r\n\r\n&emsp; 1 i.gtld-servers.net 192.43.172.30 NON-AUTH 36 ms Received 4 Referrals , rcode=NO_ERROR &emsp; google.com.\t172800\tIN\tNS\tns2.google.com,google.com.\t172800\tIN\tNS\tns1.google.com,google.com.\t172800\tIN\tNS\tns3.google.com,google.com.\t172800\tIN\tNS\tns4.google.com,\r\n&emsp; 2 ns4.google.com 216.239.38.10 AUTH 10 ms Received 1 Answers , rcode=NO_ERROR &emsp; google.com.\t300\tIN\tMX\t10 smtp.google.com,\r\nLookupServer 98ms\r\n'
//           }
//         ],
//         MxRep: 10000,
//         EmailServiceProvider: null,
//         DnsServiceProvider: null,
//         DnsServiceProviderIdentifier: null,
//         RelatedLookups: [
//           {
//             Name: 'dns lookup',
//             URL: 'https://mxtoolbox.com/api/v1/lookup/a/google.com',
//             Command: 'a',
//             CommandArgument: 'google.com'
//           },
//           {
//             Name: 'dns check',
//             URL: 'https://mxtoolbox.com/api/v1/lookup/dns/google.com',
//             Command: 'dns',
//             CommandArgument: 'google.com'
//           },
//           {
//             Name: 'spf lookup',
//             URL: 'https://mxtoolbox.com/api/v1/lookup/spf/google.com',
//             Command: 'spf',
//             CommandArgument: 'google.com'
//           },
//           {
//             Name: 'dns propagation',
//             URL: 'https://mxtoolbox.com/api/v1/lookup/mx/google.com:all',
//             Command: 'mx',
//             CommandArgument: 'google.com:all'
//           }
//         ]
//       },
//       headers: {
//         'content-type': 'application/json; charset=utf-8',
//         'content-length': '3342',
//         connection: 'close',
//         vary: 'Accept-Encoding',
//         date: 'Sun, 23 Apr 2023 20:05:21 GMT',
//         'cache-control': 'no-cache',
//         pragma: 'no-cache',
//         expires: '-1',
//         server: 'Microsoft-IIS/10.0',
//         'x-powered-by': 'UrlRewriter.NET 2.0.0, ASP.NET',
//         'access-control-allow-origin': '*',
//         'x-aspnet-version': '4.0.30319',
//         'access-control-allow-credentials': 'true',
//         'x-served-by': '10.140.23.162',
//         'x-stage': 'prod',
//         'x-role': 'LookupServer',
//         'set-cookie': ['HttpOnly;Secure;SameSite=Strict'],
//         'x-cache': 'Miss from cloudfront',
//         via: '1.1 33f963e9ac9cd82e403855fad4e8a97c.cloudfront.net (CloudFront)',
//         'x-amz-cf-pop': 'LAX53-P4',
//         'x-amz-cf-id': 'KgSEaLr-6UvbkbIKOCYnSkmYFR-3a1Iz_KxSYgTWylquQD9hCJ1Low=='
//       },
//       request: {
//         uri: {
//           protocol: 'https:',
//           slashes: true,
//           auth: null,
//           host: 'mxtoolbox.com',
//           port: 443,
//           hostname: 'mxtoolbox.com',
//           hash: null,
//           search: '?argument=google.com',
//           query: 'argument=google.com',
//           pathname: '/api/v1/Lookup/mx/',
//           path: '/api/v1/Lookup/mx/?argument=google.com',
//           href: 'https://mxtoolbox.com/api/v1/Lookup/mx/?argument=google.com'
//         },
//         method: 'GET',
//         headers: {
//           Authorization: 'ae126780-8e62-43c1-9c49-228f809cfbe7',
//           Accept: 'application/json'
//         }
//       }
//     }
//   },
//   {
//     entity: {
//       type: 'domain',
//       types: ['domain'],
//       isIP: false,
//       isIPv4: false,
//       isIPv6: false,
//       isPrivateIP: false,
//       IPType: '',
//       isHex: false,
//       isHash: false,
//       isMD5: false,
//       isSHA1: false,
//       isSHA256: false,
//       isSHA512: false,
//       hashType: '',
//       isGeo: false,
//       isEmail: false,
//       isURL: false,
//       isDomain: true,
//       isHTMLTag: false,
//       latitude: 0,
//       longitude: 0,
//       channels: [],
//       rawValue: 'google.com',
//       requestContext: {
//         isUserInitiated: true,
//         requestType: 'OnDemand'
//       },
//       value: 'google.com',
//       transformedType: 'domain'
//     },
//     result: {
//       statusCode: 200,
//       body: {
//         UID: null,
//         ArgumentType: 'domain',
//         Command: 'blacklist',
//         IsTransitioned: false,
//         CommandArgument: 'google.com',
//         TimeRecorded: '2023-04-23T15:05:21.4626502-05:00',
//         ReportingNameServer: 'ns4.google.com',
//         TimeToComplete: '98',
//         RelatedIP: null,
//         ResourceRecordType: 15,
//         IsEmptySubDomain: false,
//         IsEndpoint: false,
//         HasSubscriptions: false,
//         AlertgroupSubscriptionId: null,
//         Failed: [
//           {
//             ID: 197,
//             Name: 'DMARC Policy Not Enabled',
//             Info: 'DMARC Quarantine/Reject policy enabled',
//             Url: 'https://mxtoolbox.com/Problem/mx/DMARC-Policy-Not-Enabled?page=prob_mx&showlogin=1&hidetoc=1&action=mx:google.com',
//             PublicDescription: null,
//             IsExcludedByUser: false
//           },
//           {
//             ID: 506,
//             Name: 'DNS Record Published',
//             Info: 'DNS Record found',
//             Url: 'https://mxtoolbox.com/Problem/mx/DNS-Record-Published?page=prob_mx&showlogin=1&hidetoc=1&action=mx:google.com',
//             PublicDescription: null,
//             IsExcludedByUser: false
//           }
//         ],
//         Warnings: [],
//         Passed: [
//           {
//             ID: 441,
//             Name: 'BLACK_LIST',
//             Info: 'BLACK_LIST',
//             Url: 'BLACK',
//             PublicDescription: null,
//             IsExcludedByUser: false
//           },
//           {
//             ID: 197,
//             Name: 'DMARC Policy Not Enabled',
//             Info: 'DMARC Quarantine/Reject policy enabled',
//             Url: 'https://mxtoolbox.com/Problem/mx/DMARC-Policy-Not-Enabled?page=prob_mx&showlogin=1&hidetoc=1&action=mx:google.com',
//             PublicDescription: null,
//             IsExcludedByUser: false
//           },
//           {
//             ID: 506,
//             Name: 'DNS Record Published',
//             Info: 'DNS Record found',
//             Url: 'https://mxtoolbox.com/Problem/mx/DNS-Record-Published?page=prob_mx&showlogin=1&hidetoc=1&action=mx:google.com',
//             PublicDescription: null,
//             IsExcludedByUser: false
//           }
//         ],
//         Timeouts: [],
//         Errors: [],
//         IsError: false,
//         Information: [
//           {
//             Pref: '10',
//             Hostname: 'smtp.google.com',
//             'IP Address': '142.251.111.27',
//             TTL: '5 min',
//             Asn: '[{"asname":"Google LLC", "asn":"15169"}]',
//             IsIpV6: 'False'
//           },
//           {
//             Pref: '10',
//             Hostname: 'smtp.google.com',
//             'IP Address': '2607:f8b0:4004:c19::1b',
//             TTL: '5 min',
//             Asn: '[]',
//             IsIpV6: 'True'
//           }
//         ],
//         MultiInformation: [],
//         Transcript: [
//           {
//             Transcript:
//               '- - - mx:google.com\r\n\r\n&emsp; 1 i.gtld-servers.net 192.43.172.30 NON-AUTH 36 ms Received 4 Referrals , rcode=NO_ERROR &emsp; google.com.\t172800\tIN\tNS\tns2.google.com,google.com.\t172800\tIN\tNS\tns1.google.com,google.com.\t172800\tIN\tNS\tns3.google.com,google.com.\t172800\tIN\tNS\tns4.google.com,\r\n&emsp; 2 ns4.google.com 216.239.38.10 AUTH 10 ms Received 1 Answers , rcode=NO_ERROR &emsp; google.com.\t300\tIN\tMX\t10 smtp.google.com,\r\nLookupServer 98ms\r\n'
//           }
//         ],
//         MxRep: 20000,
//         EmailServiceProvider: 'DATA_BLACKLIST',
//         DnsServiceProvider: 'DATA_BLACKLIST',
//         DnsServiceProviderIdentifier: 'DATA_BLACKLIST',
//         RelatedLookups: [
//           {
//             Name: 'dns lookup',
//             URL: 'https://mxtoolbox.com/api/v1/lookup/a/google.com',
//             Command: 'a',
//             CommandArgument: 'google.com'
//           },
//           {
//             Name: 'dns check',
//             URL: 'https://mxtoolbox.com/api/v1/lookup/dns/google.com',
//             Command: 'dns',
//             CommandArgument: 'google.com'
//           },
//           {
//             Name: 'spf lookup',
//             URL: 'https://mxtoolbox.com/api/v1/lookup/spf/google.com',
//             Command: 'spf',
//             CommandArgument: 'google.com'
//           },
//           {
//             Name: 'dns propagation',
//             URL: 'https://mxtoolbox.com/api/v1/lookup/mx/google.com:all',
//             Command: 'mx',
//             CommandArgument: 'google.com:all'
//           }
//         ]
//       },
//       headers: {
//         'content-type': 'application/json; charset=utf-8',
//         'content-length': '3342',
//         connection: 'close',
//         vary: 'Accept-Encoding',
//         date: 'Sun, 23 Apr 2023 20:05:21 GMT',
//         'cache-control': 'no-cache',
//         pragma: 'no-cache',
//         expires: '-1',
//         server: 'Microsoft-IIS/10.0',
//         'x-powered-by': 'UrlRewriter.NET 2.0.0, ASP.NET',
//         'access-control-allow-origin': '*',
//         'x-aspnet-version': '4.0.30319',
//         'access-control-allow-credentials': 'true',
//         'x-served-by': '10.140.23.162',
//         'x-stage': 'prod',
//         'x-role': 'LookupServer',
//         'set-cookie': ['HttpOnly;Secure;SameSite=Strict'],
//         'x-cache': 'Miss from cloudfront',
//         via: '1.1 33f963e9ac9cd82e403855fad4e8a97c.cloudfront.net (CloudFront)',
//         'x-amz-cf-pop': 'LAX53-P4',
//         'x-amz-cf-id': 'KgSEaLr-6UvbkbIKOCYnSkmYFR-3a1Iz_KxSYgTWylquQD9hCJ1Low=='
//       },
//       request: {
//         uri: {
//           protocol: 'https:',
//           slashes: true,
//           auth: null,
//           host: 'mxtoolbox.com',
//           port: 443,
//           hostname: 'mxtoolbox.com',
//           hash: null,
//           search: '?argument=google.com',
//           query: 'argument=google.com',
//           pathname: '/api/v1/Lookup/mx/',
//           path: '/api/v1/Lookup/mx/?argument=google.com',
//           href: 'https://mxtoolbox.com/api/v1/Lookup/mx/?argument=google.com'
//         },
//         method: 'GET',
//         headers: {
//           Authorization: 'ae126780-8e62-43c1-9c49-228f809cfbe7',
//           Accept: 'application/json'
//         }
//       }
//     }
//   }
// ];
