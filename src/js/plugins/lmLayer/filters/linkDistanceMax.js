var Backbone = require('backbone');
var NumberView = require('../../../views/number');
var L = require('leaflet');

module.exports = {
  model: Backbone.Model.extend({
    test: function(model) {
      return model.getDistance() <= this.get('val');
    }
  }),
  controlView: NumberView.extend({
    placeholder: 'Maximum distance (m)'
  })
};
