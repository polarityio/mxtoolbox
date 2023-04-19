// polarity.export = PolarityComponent.extend({
//   // _summary: Ember.computed.alias('block.data.details.Passed'),
//   details: Ember.computed.alias('block.data.details'),
//   // defaultSummary: Ember.computed.alias('block.data.details.Passed'),
//   // failedCount: Ember.computed.alias('block.data.details.Failed'),
//   // warningCount: Ember.computed.alias('block.data.details.Warnings'),
//   passed: Ember.computed.alias('block.data.details.Passed'),
//   // maxUniqueKeyNumber: Ember.computed.alias('details.maxUniqueKeyNumber'),
//   // _summary: [],
//   init() {
//     // this.set('_summary', this.get(`details.summary${this.get('maxUniqueKeyNumber')}`));
//     // this.set('_summary', 'TESTING THIS');
//     this._super(...arguments);
//   },
//   observer: Ember.on(
//     'willUpdate',
//     Ember.observer('details.passedCount', function () {
//       const count = this.get('passed').length;
//       console.log('count', count);
//       this.set('passedCount', count.length); // count);
//     })
//   )
// });
// // `Failed: ${failedCount} Warnings: ${warningCount} Passed: ${passedCount}`
