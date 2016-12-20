var Backbone = require('backbone');
var _ = require('underscore');
var L = require('leaflet');
var package = require('../../../package.json');
var jst = require('templates');

// pass 'collection' and 'el' to constructor (gets stored automatically)
module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.configModel = options.configModel;
    this.mapView = options.mapView;
    this.render();

    this.listenTo(this.configModel, 'change', this.render);


  },
  render: function () {
    var template = jst('controlView');
    this.$el.html(template({
      config: this.configModel,
      package: package
    }));
    this.baseLayersControls = new (require('./baseLayersControls'))({
      el: this.$('.baseLayers'),
      model: this.configModel.baseLayersModel
    });
    this.dataLayerControls = new (require('./dataLayerControls'))({
      el: this.$('.dataLayers'),
      collection: this.configModel.dataLayersColl
    });
    return this;
  },
  removeSubviews: function() {
    if (this.baseLayersControls) {
      this.baseLayersControls.remove();
    }
    if (this.dataLayersControls) {
      this.dataLayersControls.remove();
    }
  },
  remove: function() {
    this.removeSubviews();
    Backbone.View.prototype.remove.call(this);
  }
});
