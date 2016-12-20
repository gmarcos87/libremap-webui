module.exports = {
  "tileLayer": require("./plugins/tileLayer"),
  "tileLayerBing": require("./plugins/tileLayerBing"),
  "lmLayer": require("./plugins/lmLayer/index"),
  "lmFilterRouterAP": require("./plugins/lmLayer/filters/routerAP"),
  "lmFilterRouterCommunity": require("./plugins/lmLayer/filters/routerCommunity"),
  "lmFilterRouterLastUpdate": require("./plugins/lmLayer/filters/routerLastUpdate"),
  "lmFilterLinkDistanceMax": require("./plugins/lmLayer/filters/linkDistanceMax"),
  "lmFilterLinkQualityMin": require("./plugins/lmLayer/filters/linkQualityMin"),
};