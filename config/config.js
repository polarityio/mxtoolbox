module.exports = {
  name: 'MxToolbox',
  acronym: 'MXT',
  description: `Polarity's MxToolbox integration allows automated queries of MxToolbox 
    services using IP Addresses, URLs and Domains`,
  entityTypes: ['domain', 'ip', 'url'],
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
    proxy: '',
    rejectUnauthorized: true
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'url',
      name: 'MxToolBox API URL',
      description:
        'API URL for your MxToolBox instance.  The API URL should include the scheme (https://).  The default value is "https://api.mxtoolbox.com".',
      default: 'https://api.mxtoolbox.com',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiKey',
      name: 'API Key for MxToolBox',
      description: 'User API Key for MxToolBox',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'dataSources',
      name: 'Data Sources',
      description:
        'Select the data sources you would like to use for the MxToolBox integration.  If no data sources are selected, all data sources will be used.',
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
      adminOnly: false
    }
  ]
};
