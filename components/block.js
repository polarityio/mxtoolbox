polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  activeTab: 'mx',
  init() {
    const defaultDetails = this.get('details');
    this.set('passedmx', defaultDetails.Passed);
    this.set('failedmx', defaultDetails.Failed);

    this._super(...arguments);
  },
  actions: {
    searchType: function (type) {
      this.set('activeTab', type);

      this.sendIntegrationMessage({
        action: 'SEARCH_TYPE',
        data: {
          entity: this.get('block.entity'),
          type
        }
      })
        .then((response) => {
          const { Passed, Failed } = response.result.body;
          this.set('passed' + type, Passed);
          this.set('failed' + type, Failed);

          const data = response.result.body;
          this.set('searchInfo', data);
          console.log(this.get('searchInfo'));
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
