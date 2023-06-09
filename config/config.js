module.exports = {
  name: 'MxToolbox',
  acronym: 'MXT',
  description: `Polarity's MxToolbox integration allows automated queries of MxToolbox 
    services using IP Addresses, URLs and Domains`,
  entityTypes: ['domain', 'IP', 'url'],
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
    proxy: ""
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
    }
  ]
};
