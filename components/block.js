polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  activeTab: 'mx',
  init() {
    this._super(...arguments);
  },
  actions: {
    changeTab: function (tabName) {
      console.log(this.get('details'));
      this.set('activeTab', tabName);
    },
    getQuota: function () {
      this.toggleProperty('viewQuota');

      this.sendIntegrationMessage({
        action: 'GET_QUOTA',
        data: {
          entity: this.get('block.entity')
        }
      })
        .then((response) => {
          const quotaData = response[0].body;
          this.set('quota', quotaData);
        })
        .catch((err) => {
          this.set('errorMessage', JSON.stringify(`${err.message}`));
        });
    },
    togglePassedResults: function (resultType) {
      this.toggleProperty(resultType + 'Passed');
    },
    toggleFailedResults: function (resultType) {
      this.toggleProperty(resultType + 'Failed');
    }
  }
});
