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
      this.toggleProperty('passed');
    }

    if (currentData.Failed.length <= 3) {
      this.toggleProperty('failed');
    }

    this._super(...arguments);
  },
  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
      this.set('currentDisplayedData', this.get(tabName + 'Data'));
    },
    getQuota: function () {
      this.toggleProperty('viewQuota');

      if (this.get('viewQuota')) {
        this.sendIntegrationMessage({
          action: 'GET_QUOTA',
          data: {
            entity: this.get('block.entity')
          }
        })
          .then((response) => {
            console.log(response);
            const quotaData = response[0].result.body;
            this.set('quota', quotaData);
          })
          .catch((err) => {
            this.set('errorMessage', JSON.stringify(`${err.message}`));
          });
      }
    },
    togglePassedResults: function (resultType) {
      this.toggleProperty(resultType);
    },
    toggleFailedResults: function (resultType) {
      this.toggleProperty(resultType);
    }
  }
});
