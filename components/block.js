polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  urls: Ember.computed.alias('block.data.details.urls'),
  inCategory: Ember.computed.alias('block.data.details.inCategory'),
  categories: '',
  selectedCategory: '',
  addUrlMessage: '',
  removeUrlErrorMessage: '',
  removeUrlMessage: '',
  disableAddUrlButton: true,
  disableRemoveUrlButton: true,
  categoryLookupErrorMessage: '',
  showCategoryMessage: false,
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  init () {
    const categories = this.get('block.userOptions.categories');
    const list = categories.split(',');
    // add a default option to the beginning of the list.
    list.unshift('Select a Category');
    // set the first category in the user options list as the default
    this.set('selectedCategory', list[0]);
    this.set('categories', list);

    this._super(...arguments);
  },
  actions: {
    addUrl: async function () {
      this.set('addButtonIsRunning', true);

      this.sendIntegrationMessage({
        action: 'ADD_URL',
        data: {
          entity: this.get('block.entity'),
          category: this.get('selectedCategory'),
          configuredName: this.get('configuredName')
        }
      })
        .then((response) => {
          if (response.result.statusCode === 200) {
            this.set('addUrlMessage', 'URL Added Successfully');
          }
        })
        .catch((err) => {
          // this.set('addUrlErrorMessage', 'ADASDSASS');
          this.set('addButtonIsRunning', true);
        })
        .finally(() => {
          this.set('addButtonIsRunning', false);
          this.set('addUrlErrorMessage', '');
          this.get('block').notifyPropertyChange('data');
        });
    },
    removeUrl: async function () {
      this.set('removeButtonIsRunning', true);

      this.sendIntegrationMessage({
        action: 'REMOVE_URL',
        data: {
          entity: this.get('block.entity'),
          category: this.get('selectedCategory'),
          configuredName: this.get('configuredName')
        }
      })
        .then((response) => {
          if (response.result.statusCode === 200) {
            this.set('removeUrlMessage', 'URL Removed Successfully');
          }
        })
        .catch((err) => {
          this.set('removeButtonIsRunning', false);
          this.set('removeUrlErrorMessage', `${err.meta.detail}`);
        })
        .finally(() => {
          this.set('removeButtonIsRunning', false);
          this.set('removeUrlErrorMessage', '');
          this.get('block').notifyPropertyChange('data');
        });
    },
    categoryLookup: function (event) {
      const category = event.target.value;
      this.set('selectedCategory', category);
      this.set('loadingCategory', true);
      this.set('disableAddUrlButton', true);
      this.set('disableRemoveUrlButton', true);
      this.set('showCategoryMessage', true);

      this.sendIntegrationMessage({
        action: 'CATEGORY_LOOKUP',
        data: {
          entity: this.get('block.entity'),
          category: category
        }
      })
        .then((response) => {
          // the query functions always return an array of results, this will only
          // ever be a single object, so we can just grab the first element.
          this.set('inCategory', response[0].result.body.inCategory);
          this.set('configuredName', response[0].result.body.configuredName);
        })
        .catch((err) => {
          this.set('categoryLookupErrorMessage', `${err.meta.detail}`);
        })
        .finally(() => {
          const isInCategory = this.get('inCategory');

          if (isInCategory) {
            this.set('disableRemoveUrlButton', false);
          } else if (!isInCategory) {
            this.set('disableAddUrlButton', false);
          }

          this.set('loadingCategory', false);
          this.set('categoryLookupErrorMessage', '');
          this.get('block').notifyPropertyChange('data');
        });
    }
  }
});
