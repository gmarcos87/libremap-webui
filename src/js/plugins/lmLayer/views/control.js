var Backbone = require('backbone');
var _ = require('underscore');
var BootstrapView = require('../../../views/bootstrap');
var RadioView = require('../../../views/radio');
var CheckboxView = require('../../../views/checkbox');
var jst = require('templates');

var FilterView = BootstrapView.extend({
  initialize: function() {
    this.render();
  },
  template: jst('lmFilter'),
  render: function() {
    var model = this.model;
    this.$el.html(this.template(model.toJSON()));
    this.bindCheckbox('.filter_check', 'enabled');

    var plugin = model.plugin;
    if (plugin.controlView) {
      this.bindVisibility('.filter_control', 'enabled');
      this.subview = new plugin.controlView({
        el: this.$('.filter_control'),
        model: this.model
      });
    }
    return this;
  },
  removeSubview: function() {
    if (this.subview) {
      this.subview.remove();
      this.subview = undefined;
    }
  },
  remove: function() {
    this.removeSubview();
    BootstrapView.prototype.remove.call(this);
  }
});

var FiltersCollView = Backbone.View.extend({
  initialize: function() {
    this.subviews = {};
    this.listenTo(this.collection, 'remove', this.removeModel);
    this.listenTo(this.collection, 'add', this.addModel);
    this.render();
  },
  addModel: function(model) {
    this.subviews[model.cid] = new FilterView({
      model: model
    });
    this.$el.append(this.subviews[model.cid].$el);
  },
  removeModel: function(model) {
    if (this.subviews[cid]) {
      this.subviews[cid].remove();
      delete this.subviews[cid];
    }
  },
  render: function() {
    this.collection.each(this.addModel, this);
    return this;
  },
  remove: function() {
    _.each(this.subviews, function(view) {
      view.remove();
    });
    BootstrapView.prototype.remove.call(this);
  }
});

module.exports = BootstrapView.extend({
  initialize: function() {
    this.render();
  },
  template: jst('libremapLayerControl'),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.listenTo(this.model, 'change:api_url change:fine_max', function(model) {
      $('#api_url').val(model.get('api_url'));
      $('#fine_max').val(model.get('fine_max'));
    });
    this.$('.configure').on('click', function(e) {
      e.preventDefault();
      this.$('.configuration').slideToggle();
    }.bind(this));
    this.$('.configuration > form').on('submit', function(e) {
      e.preventDefault();
      var vals = {
        api_url: this.$('#api_url').val(),
        fine_max: Number(this.$('#fine_max').val()),
      };
      this.$('.configuration').slideToggle();
      this.model.set(vals);
    }.bind(this));

    // routers
    this.bindCheckbox('#show_routers', 'show_routers');
    // bind visibility of routers panel
    this.bindVisibility('.lmPanelRouters', 'show_routers');
    // cluster checkbox
    this.clusterRoutersView = new CheckboxView({
      el: this.$('.lmPanelRouters .lmCluster'),
      model: this.model.get('routers'),
      attribute: 'cluster',
      text: 'Cluster'
    });
    // filters mode view
    this.filtersModeRoutersView = new RadioView({
      el: this.$('.lmPanelRouters .lmFiltersMode'),
      model: this.model.get('routers'),
      attribute: 'filter_mode',
      choices: {
        'or': 'match some',
        'and': 'match all'
      }
    });
    // filters view
    this.filtersRoutersView = new FiltersCollView({
      el: this.$('.lmPanelRouters .lmFilters'),
      collection: this.model.get('routers').get('filters'),
    });

    // links
    this.bindCheckbox('#show_links', 'show_links');
    // bind visibility of links panel
    this.bindVisibility('.lmPanelLinks', 'show_links');
    // filters mode view
    this.filtersModeRoutersView = new RadioView({
      el: this.$('.lmPanelLinks .lmFiltersMode'),
      model: this.model.get('links'),
      attribute: 'filter_mode',
      choices: {
        'or': 'match some',
        'and': 'match all'
      }
    });
    // filters view
    this.filtersLinksView = new FiltersCollView({
      el: this.$('.lmPanelLinks .lmFilters'),
      collection: this.model.get('links').get('filters'),
    });
  },
  remove: function() {
    this.clusterRoutersView.remove();
    this.filtersModeRoutersView.remove();
    this.filtersRoutersView.remove();
    this.filtersLinksView.remove();
    BootstrapView.prototype.remove.call(this);
  }
});
