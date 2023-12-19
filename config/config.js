module.exports = {
  name: 'LogScale',
  acronym: 'LGS',
  description: `LogScale is a log management platform that allows you to collect, index, search, and analyze machine-generated data from any source, any format, and any scale.`,
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
    proxy: ''
  },
  logging: {
    level: 'trace' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'url',
      name: 'LogScale URL',
      description: 'URl for the LogScale API.',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'repositories',
      name: 'LogScale Repositories',
      description:
        "Comma separated list of repositories with associated tokens, e.g. 'repo1:token1,repo2:token2'. TIP: Use the view icon to the left to revel text.",
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
