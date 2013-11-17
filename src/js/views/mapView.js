var Backbone = require('backbone');
var _ = require('underscore');
var L = require('leaflet');
var common = require('libremap-common');
var couchmap_common = require('couchmap-common');
var config = require('../../../config.json');
var MapView = require('couchmap-leaflet/views/map');

// pass 'collection' and 'el' to constructor (gets stored automatically)
module.exports = MapView.extend({
  initialize: function (options) {
    this.router = options.router;

    MapView.prototype.initialize.call(this, _.extend({
      addDefaultLayer: false,
      zoomTo: false
    }, options || {}));
    
    L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        "key": 'e4e152a60cc5414eb81532de3d676261',
        "styleId": 997,
        "attribution": "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery &copy; <a href=\"http://cloudmade.com\">CloudMade</a>"
        }).addTo(this.map);
    /*
    var layers = {};
    _.each(config.layers, function(layer, name) {
      if (layer.type=="tileLayer") {
        layers[name] = L.tileLayer(layer.url, layer.options || {});
      }
    });
    // use default cloudmade layer if no layer was given in config.json
    if (!_.size(layers)) {
      layers['Cloudmade OSM'] = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        "key": 'e4e152a60cc5414eb81532de3d676261',
        "styleId": 997,
        "attribution": "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery &copy; <a href=\"http://cloudmade.com\">CloudMade</a>"
        });
    }
    this.layers = layers;
    */


    // add layer views
    /*
    this.libreMap.get('baseLayers').each(function(layer) {
      var view = new this.layer_plugins[layer.get('type')].view({mapView: this, model: layer});
    }, this);
    this.libreMap.get('overlays').each(function(e){console.log(e);});
    */


    var world_bounds = [[-60,-180],[75,180]];
    // init map bounds (will be reset via router if bbox was provided)
    this.map.fitBounds(world_bounds);

    // bind to router bbox event
    this.router.on('route:bbox', function(bbox) {
      bbox = couchmap_common.bbox(bbox);
      if (bbox) {
        // valid bbox
        bbox = couchmap_common.toLeaflet();
        var lat = bbox[1][0] - bbox[0][0];
        var lon = bbox[1][1] - bbox[0][1];
        var ratio = 0.01;
        bbox[0][0] += ratio*lat;
        bbox[1][0] -= ratio*lat;
        bbox[0][1] += ratio*lon;
        bbox[1][1] -= ratio*lon;
        console.log(bbox);
        this.map.fitBounds(bbox);
      } else {
        this.map.fitBounds(world_bounds);
      }
    }, this);
    this.map.on('moveend', function(e) {
      var bbox = couchmap_common.bbox(this.map.getBounds());
      this.trigger('bbox', bbox);
      this.router.navigate('bbox/'+bbox.toString());
    }, this);

  }
});
