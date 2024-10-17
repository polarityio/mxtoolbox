module.exports = {
  name: 'MxToolbox',
  acronym: 'MXT',
  description: `Polarity's MxToolbox integration allows automated queries of MxToolbox 
    services using IP Addresses, URLs and Domains`,
  entityTypes: ['domain', 'IPv4', 'IPv6', 'url'],
  styles: ['./styles/styles.less'],
  defaultColor: 'light-blue',
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: ''
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'apiKey',
      name: 'API Key for MxToolbox',
      description: 'User API Key for MxToolbox',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'dataSources',
      name: 'Data Sources',
      description:
        'Select the data sources you would like to use for the MxToolbox integration.  If no data sources are selected, all data sources will be used.',
      default: [
        {
          value: 'mx',
          display: 'mx'
        },
        {
          value: 'blacklist',
          display: 'blacklist'
        },
        {
          value: 'http',
          display: 'http'
        },
        {
          value: 'https',
          display: 'https'
        }
      ],
      type: 'select',
      options: [
        {
          value: 'mx',
          display: 'mx'
        },
        {
          value: 'blacklist',
          display: 'blacklist'
        },
        {
          value: 'http',
          display: 'http'
        },
        {
          value: 'https',
          display: 'https'
        }
      ],
      multiple: true,
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'blocklist',
      name: 'Indicator Blocklist',
      description:
        'Comma delimited list of indicators you do not want looked up.  List is an exact match (URL matches require the scheme).  This option must be set to "Only Admins Can View and Edit".',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'domainUrlBlocklistRegex',
      name: 'Domain and URL Blocklist Regex',
      description:
        'Domains or URLs that match the given regex will not be looked up (if blank, all domains and URLS will be looked up).  Note that the regex does not need to account for the scheme for URLs (i.e., the regex will match against the domain and subdomain of the URL. Do not wrap your regex in forward slashes. This option must be set to "Only Admins Can View and Edit".',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },

    {
      key: 'ipBlocklistRegex',
      name: 'IP Blocklist Regex',
      description:
        'IPs that match the given regex will not be looked up (if blank, all IPs will be looked up).  Do not wrap your regex in forward slashes. This option must be set to "Only Admins Can View and Edit".',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
