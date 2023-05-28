polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  mxData: Ember.computed('details.mx', function () {
    return this.get('details.mx');
  }),
  blacklistData: Ember.computed('details.blacklist', function () {
    return this.get('details.blacklist');
  }),
  httpData: Ember.computed('details.http', function () {
    return this.get('details.http');
  }),
  httpsData: Ember.computed('details.https', function () {
    return this.get('details.https');
  }),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  passed: false,
  failed: false,
  warnings: false,
  activeTab: '',
  init() {
    const keysList = ['mx', 'blacklist', 'http', 'https'];
    const details = this.get('details');

    const getFirstKey = (keysList, obj) =>
      keysList.find((key) => obj.hasOwnProperty(key)) || null;

    const defaultKey = getFirstKey(keysList, details);

    this.set('activeTab', defaultKey);
    this.set('currentDisplayedData', this.get(defaultKey + 'Data'));

    if (!this.get('block._state')) {
      // init section states that we track to ensure that state is unique per tab
      // and is not lost if the details block is closed.
      this.set('block._state', {
        mx: {
          passed: false,
          failed: false,
          warnings: false,
          information: false
        },
        blacklist: {
          passed: false,
          failed: false,
          warnings: false,
          information: false
        },
        http: {
          passed: false,
          failed: false,
          warnings: false,
          information: false
        },
        https: {
          passed: false,
          failed: false,
          warnings: false,
          information: false
        }
      });
      this.setTabDefaultState('mx');
      this.setTabDefaultState('blacklist');
      this.setTabDefaultState('http');
      this.setTabDefaultState('https');
    }

    this._super(...arguments);
  },
  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
      this.set('currentDisplayedData', this.get(tabName + 'Data'));
      console.info(this.get('currentDisplayedData'));
    },
    toggleSection: function (sectionName) {
      const activeTab = this.get('activeTab');
      this.toggleProperty(`block._state.${activeTab}.${sectionName}`);
    },
    toggleQuota: function () {
      this.getQuota();
      this.toggleProperty('showQuota');
    }
  },
  setTabDefaultState: function (tabName) {
    const currentData = this.get(`${tabName}Data`);
    if (currentData) {
      this.setTabState(tabName, 'passed', currentData.Passed.length <= 3);
      this.setTabState(tabName, 'failed', currentData.Failed.length <= 3);
      this.setTabState(tabName, 'warnings', currentData.Warnings.length <= 3);
      this.setTabState(tabName, 'information', currentData.Information.length <= 3);
    }
  },
  setTabState(tabName, sectionName, isOpen) {
    this.set(`block._state.${tabName}.${sectionName}`, isOpen);
  },
  getQuota: function () {
    if (!this.get('quotaRequested')) {
      this.set('quotaRequested', true);

      this.sendIntegrationMessage({
        action: 'GET_QUOTA',
        data: {
          entity: this.get('block.entity')
        }
      })
        .then((response) => {
          if (Array.isArray(response) && response.length > 0 && response[0].result) {
            const quotaData = response[0].result.body;
            this.set('quota', quotaData);
          } else {
            console.error('Unexpected Quota Response', response);
          }
        })
        .catch((err) => {
          this.set('errorMessage', JSON.stringify(`${err.message}`));
        });
    }
  }
});
