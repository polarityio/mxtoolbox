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

    const currentData = this.get('currentDisplayedData');

    if (currentData.Passed.length <= 3) {
      this.set('passed', true);
    }

    if (currentData.Failed.length <= 3) {
      this.set('failed', true);
    }

    if (currentData.Warnings.length <= 3) {
      this.set('warnings', true);
    }

    this._super(...arguments);
  },
  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
      this.set('currentDisplayedData', this.get(tabName + 'Data'));
    },
    togglePassedResults: function () {
      this.toggleProperty('passed');
    },
    toggleFailedResults: function () {
      this.toggleProperty('failed');
    },
    toggleWarningResults: function () {
      this.toggleProperty('warnings');
    },
    toggleQuota: function () {
      this.getQuota();
      this.toggleProperty('showQuota');
    }
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
