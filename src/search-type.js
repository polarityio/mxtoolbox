const { polarityRequest } = require('./polarity-request');
const { getLogger } = require('./logger');

async function searchType(payload) {
  const Logger = getLogger();
  Logger.trace({ payload }, 'searchType payload');

  const requestOptions = {
    entity: payload.data.entity,
    method: 'GET',
    path: `/api/v1/Lookup/${payload.data.type}/?argument=` + payload.data.entity.value
  };

  const response = await polarityRequest.send(requestOptions);
  Logger.trace({ response }, 'get response');

  return response;
}

// {
//   "UID": null,
//   "ArgumentType": "domain",
//   "Command": "mx",
//   "IsTransitioned": false,
//   "CommandArgument": "google.com",
//   "TimeRecorded": "2023-03-22T13:25:42.5040074-05:00",
//   "ReportingNameServer": "ns3.google.com",
//   "TimeToComplete": "100",
//   "RelatedIP": null,
//   "ResourceRecordType": 15,
//   "IsEmptySubDomain": false,
//   "IsEndpoint": false,
//   "HasSubscriptions": false,
//   "AlertgroupSubscriptionId": null,
//   "Failed": [],
//   "Warnings": [],
//   "Passed": [
//       {
//           "ID": 441,
//           "Name": "DMARC Record Published",
//           "Info": "DMARC Record found",
//           "Url": "https://mxtoolbox.com/Problem/mx/DMARC-Record-Published?page=prob_mx&showlogin=1&hidetoc=1&action=mx:google.com",
//           "PublicDescription": null,
//           "IsExcludedByUser": false
//       },
//       {
//           "ID": 197,
//           "Name": "DMARC Policy Not Enabled",
//           "Info": "DMARC Quarantine/Reject policy enabled",
//           "Url": "https://mxtoolbox.com/Problem/mx/DMARC-Policy-Not-Enabled?page=prob_mx&showlogin=1&hidetoc=1&action=mx:google.com",
//           "PublicDescription": null,
//           "IsExcludedByUser": false
//       },
//       {
//           "ID": 506,
//           "Name": "DNS Record Published",
//           "Info": "DNS Record found",
//           "Url": "https://mxtoolbox.com/Problem/mx/DNS-Record-Published?page=prob_mx&showlogin=1&hidetoc=1&action=mx:google.com",
//           "PublicDescription": null,
//           "IsExcludedByUser": false
//       }
//   ],
//   "Timeouts": [],
//   "Errors": [],
//   "IsError": false,
//   "Information": [
//       {
//           "Pref": "10",
//           "Hostname": "smtp.google.com",
//           "IP Address": "172.253.115.27",
//           "TTL": "5 min",
//           "Asn": "[{\"asname\":\"Google LLC\", \"asn\":\"15169\"}]",
//           "IsIpV6": "False"
//       },
//       {
//           "Pref": "10",
//           "Hostname": "smtp.google.com",
//           "IP Address": "2607:f8b0:4004:c06::1b",
//           "TTL": "5 min",
//           "Asn": "[]",
//           "IsIpV6": "True"
//       }
//   ],
//   "MultiInformation": [],
//   "Transcript": [
//       {
//           "Transcript": "- - - mx:google.com\r\n\r\n&emsp; 1 e.gtld-servers.net 192.12.94.30 NON-AUTH 0 ms Received 4 Referrals , rcode=NO_ERROR &emsp; google.com.\t172800\tIN\tNS\tns2.google.com,google.com.\t172800\tIN\tNS\tns1.google.com,google.com.\t172800\tIN\tNS\tns3.google.com,google.com.\t172800\tIN\tNS\tns4.google.com,\r\n&emsp; 2 ns3.google.com 216.239.36.10 AUTH 16 ms Received 1 Answers , rcode=NO_ERROR &emsp; google.com.\t300\tIN\tMX\t10 smtp.google.com,\r\nLookupServer 100ms\r\n"
//       }
//   ],
//   "MxRep": 0,
//   "EmailServiceProvider": null,
//   "DnsServiceProvider": null,
//   "DnsServiceProviderIdentifier": null,
//   "RelatedLookups": [
//       {
//           "Name": "dns lookup",
//           "URL": "https://mxtoolbox.com/api/v1/lookup/a/google.com",
//           "Command": "a",
//           "CommandArgument": "google.com"
//       },
//       {
//           "Name": "dns check",
//           "URL": "https://mxtoolbox.com/api/v1/lookup/dns/google.com",
//           "Command": "dns",
//           "CommandArgument": "google.com"
//       },
//       {
//           "Name": "spf lookup",
//           "URL": "https://mxtoolbox.com/api/v1/lookup/spf/google.com",
//           "Command": "spf",
//           "CommandArgument": "google.com"
//       },
//       {
//           "Name": "dns propagation",
//           "URL": "https://mxtoolbox.com/api/v1/lookup/mx/google.com:all",
//           "Command": "mx",
//           "CommandArgument": "google.com:all"
//       }
//   ]
// }
module.exports = { searchType };
