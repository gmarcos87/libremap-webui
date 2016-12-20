var $ = require('jquery');
var configParser = require('./configParser');
$(document).ready(function() {
  require('./config_vendor');

  var config = require('../../config.json');
  // set title
  var title = "LibreMap";
  if (typeof(config.title)!="undefined") {
    title += " – " + config.title;
  }
  document.title = title;
  // read plugins (generated via grunt)
  config.plugins = require('./plugins');

  // create ConfigModel
  // TODO: read config that is stored in browser
  var ConfigModel = require('./models/config');
  var configModel = new ConfigModel(config);
  var Backbone = require('backbone');
  // router fires events
  var LibreMapRouter = Backbone.Router.extend({
    routes: {
      "bbox/:bbox(/)":"bbox",
      "bbox/:bbox(/)(lm-options/:lmOptions)":"bbox",
    }
  });
  var router = new LibreMapRouter();

  var RootView = require('./views/root');


  var root = new RootView({
    el: 'body',
    router: router,
    configModel: configModel
  });


  root.listenTo(router, 'route:bbox', function(bbox,lmOptions) {
      configParser.init(lmOptions,router,configModel,
        function() {
        }
      );
  });


  Backbone.history.start();
});
