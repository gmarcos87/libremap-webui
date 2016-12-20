var queryString = require('query-string');

module.exports = {
  load: false,
  init: function(data,router,configModel,cb){
    this.router = router;
    this.configModel = configModel;
    this.data = this.parseUrl(data);
    this.level = '-';

    //Update models -->> Fix this
    if(this.data.show_routers !== undefined && this.load == false){
      this.assignR(this.data,configModel.dataLayersColl.models[0]);
      this.load = true;
    }
    //Listen configModel events and update url
    this.getEvents(configModel.dataLayersColl.models,function(model){
      model.on('change',function(e){
        this.toUrl(model.attributes,e);
      },this);
    });
    cb();
  },
  assignR: function(attr,model){
      for (var key in model.attributes) {
          if(attr[key] !== undefined){
            if(typeof model.attributes[key] !== 'object'){
              var tmp = {};
              tmp[key]=attr[key];
              model.set(tmp);
              //console.log(this.level + '> Asignando '+attr[key]+' a '+key);
            }
            else if (model.attributes[key].length){
              for (var i = 0; i < model.attributes[key].length; i++) {
                //si tiene model
                if(model.attributes[key].models){
                  this.assignR(attr[key][i],model.attributes[key].models[i]);
                }
                //si es simplemente un array
                else {
                  model.attributes[key][i] = attr[key][i];
                  //console.log(this.level + '> Asignando '+attr[key][i]+' a '+key);
                }

                //this.assignR(attr[key][i],model.attributes[key][i].get(key[i]));
              }
            }
            else {
              this.level = this.level +'---';
              this.assignR(attr[key],model.get(key));
            }
          }
      }
      this.level = this.level.slice(0,-3);
  },
  getEvents: function(eventList,cb){
    _.each(eventList,cb,this);
  },
  parseUrl: function(data){
    /*console.log(data);
    if(data){
      var options = data.split('|');
      options = options
        .map(function(x){
          return x.split('@');
        })
        .map(function(x){
          var tmp = {};
          tmp[x[0]]=x[1];
          return tmp;
        })
        .reduce(function(prev,act){
          return Object.assign(prev,act);
      });
      console.log(options);
      return options;
    }*/
    if(data){
      var result = JSON.parse(unescape(decodeURIComponent(data)));
      console.log(result);
      return result;
    }    return {};
  },
  toUrl: function(attrs,e){
    var urlBase = Backbone.history.location.hash.split('/lm-options/');
    /*var urlNew = '';
    for (var key in attrs) {
      if (attrs.hasOwnProperty(key) && typeof attrs[key] != 'object') {
        urlNew += key+'@'+ encodeURIComponent(escape(attrs[key]))+'|';
      }
    }
    urlNew = urlNew.slice(0,-1);*/
    var urlNew =  encodeURIComponent(escape(JSON.stringify(attrs)));
    this.router.navigate(urlBase[0]+'/lm-options/'+urlNew,{trigger:true});
  }
};
