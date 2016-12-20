var Backbone = require('backbone');
var ControlsView = require('./controls');
var MapView = require('./map');

module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.router = options.router;
    this.configModel = options.configModel;
    var template = require('templates').rootView;
    this.$el.html(template({title: this.configModel.get('title')}));
    this.$('a.about').on('click', function() {
      this.$('div.about').modal();
      return false;
    }.bind(this) );
    this.configModel.on('change', function(){
      this.dataLayersView.render();
    },this);
    //initView
    this.initView();
  },
  render: function(){
    console.log('render');
  },
  initView: function(){
    this.mapView = new MapView({
      el: this.$('.lm-map'),
      router: this.router,
      configModel: this.configModel
    });

    this.baseLayersView = new (require('./baseLayers'))({
      model: this.configModel.baseLayersModel,
      mapView: this.mapView
    });

    this.dataLayersView = new (require('./dataLayers'))({
      collection: this.configModel.dataLayersColl,
      mapView: this.mapView
    });

    this.controlsView = new ControlsView({
      el: this.$('.lm-sidebar'),
      mapView: this.mapView,
      configModel: this.configModel,
    });
  },
  removeSubviews: function() {
    this.controlsView.remove();
    this.mapView.remove();
  },
  updateSubviews: function() {
    this.controlsView.render();
    this.mapView.render();
  },
  remove: function() {
    this.removeSubviews();
    Backbone.View.prototype.remove.call(this);
  }
});
