
var Backbone = require('backbone');
var BootstrapView = require('../../../views/bootstrap');
var jst = require('templates');
var SelectView = BootstrapView.extend({
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },
  template: jst('lmFilterSelect'),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});



module.exports = {
  model: Backbone.Model.extend({
    test: function(model) {
      return this.get('val')==model.get('community');
    }
  }),
  controlView: SelectView
};
