
enyo.kind({
  name: "enyo.CollectionRepeater",
  published: {
    controller: null,
    length: null,
    data: null,
    bindProperty: "data"
  },
  //create: function () {
  //  this.inherited(arguments);
  //  this.initBindings();
  //},
  
  //initBindings: function () {
  //  var b = this.get("bindProperty"), s;
  //  //this.clearBindings();
  //  this.binding({from: "controller.length", to: "length", oneWay: true});
  //  s = "controller." + (b[0] === "."? b.slice(1): b);
  //  this.binding({from: s, to: "data"});
  //},
  
  //controllerChanged: function () {
  //  this.inherited(arguments);
  //  this.initBindings();
  //},
  
  bindings: [
    {from: "controller.length", to: "length", oneWay: true},
    {from: "controller.data", to: "data", oneWay: true}
  ],
  
  initComponents: function () {
    this.rowControl = this.components || this.kindComponents;
    this.components = this.kindComponents = null;
    this.rowControl = this.rowControl[0];
    this.inherited(arguments);
  },
  render: function () {
    var i = 0, c, ch, m = this.get("data"), len = this.length, getController, refresh = false;
      
    getController = function (controller, model) {
      if (c) return c instanceof enyo.Controller? c.set("model", model): new c({model: model});
      if (controller && enyo.isString(controller)) c = enyo.getPath(controller);
      else if (controller && controller instanceof enyo.Controller) c = controller;
      else if (controller && enyo.isFunction(controller)) c = controller;
      if (!c) c = enyo.ModelController;
      return getController(c, model);
    };
    
    for (i = 0; i < len; ++i) {
      if ((ch = this.children[i])) {
        
        //console.log("REUSING CH");
        
        ch.controller.set("model", m[i]);
        //ch.controller.set("owner", ch);
        //ch.syncBindings();
        ch.refreshBindings();
        refresh = false;
      } else {
        
        //console.log("STARTING FRESH");
        
        refresh = true;
        
        ch = this.createComponent(this.rowControl);
        //console.log(ch, this.rowControl);
        ch.extend(enyo.CollectionRowMixin);
        //ch = this.createComponent(this.rowControl, enyo.CollectionRowProperties);
        //console.log("just created component", ch.controller, ch.controllerClass);
        //ch.set("controller", getController(ch.controller || ch.controllerClass, m[i]));
        ch.controller.set("model", m[i]);
        //ch.controllerChanged();
      }
      // NOTE: because of Control's overload of _setup
      ch._setup();
      ch._setupBindings();
      //ch.refreshBindings();
      if (refresh) ch.render();
    }
    
    if (i < this.children.length) {
      ch = this.children.slice(len);
      while (ch.length) {
        c = ch.shift();
        c.destroy();
      }
    }
  },
  
  lengthChanged: function (inOld, inNew) {
    if (inOld) this.dataChanged();
  },
  
  dataChanged: function () {
    var c = this.get("data");
    if (!c) return;
    
    // as opposed to before, manually set the length property
    // locally once we know the data has been updated
    //if (this.length !== c.length) this.set("length", c.length);
    this.render();
  }
});
