(function () {
  
  // initialize the global app reference
  enyo._app = null;
  
  enyo.app = function (inProps) {
    var n = enyo.global[inProps.name], r;
    r = (enyo.global[inProps.name] = new enyo.Application(inProps));
    if (n) for (var p in n) r[p] = n[p];
    return r;
  };
  
  enyo.kind({
    name: "enyo.Application",
    kind: "enyo.Control",
    published: {
      store: false,
      router: false,
      controller: null
    },
    _eventQueue: null,
    constructor: function (inProps) {
      var c = inProps.classes || "";
      this._eventQueue = [];
      c = inProps.name.toLowerCase() + "-app" + c;
      inProps.classes = c;
      enyo.mixin(this, inProps);
      this.inherited(arguments);
      enyo._app = this;
    },
    create: function () {
      
      // this is an ugly hack that MUST BE RETHOUGHT OUT
      // but its necessary to move the normal create method
      // order until AFTER the `main` method is called...
      this._createArguments = arguments;
    },
    start: function () {
      if (this.main && enyo.isFunction(this.main)) this.main();
      else if (window.main && enyo.isFunction (window.main)) main.call(this);
      
      // ...and...resume normal create method...
      this.inherited(this._createArguments);
      this.setup();
      this.renderInto(document.body);
      if (this.router) this.router.start();
    },
    setup: function () {
      this.setupStore();
      this.setupRouter();
    },
    
    setupStore: function () {
      var s = this.store;
      if (enyo.isString(s)) s = enyo._getPath(s);
      else return;
      if (!s) return console.warn("enyo.Application: could not " +
        "find the store `" + this.store + "`");
      s = this.store = new s();
      Backbone.sync = enyo.bind(s, function () {
        // allow for us to swap out sync at any time
        return s.sync.apply(this, arguments);
      });
    },
    
    setupRouter: function () {
      var r = this.router, c = this.controller;
      if (enyo.isString(r)) r = enyo._getPath(r);
      else return;
      if (!r) return console.warn("enyo.Application: could not " +
        "find the router `" + this.router + "`");
      r = this.router = new r();
      r.set("controller", c);
    },
    dispatchEvent: function () {
      if (!this.controller || !this.controller.handle) {
        // queue these...
        this._eventQueue.push(arguments);
        return;
      }
      if (!this.controller.handle.apply(this.controller, arguments))
        this.inherited(arguments);
    },
    controllerChanged: function () {
      this.inherited(arguments);
      var q = this._eventQueue || [], args;
      while (q.length) {
        args = q.shift();
        this.dispatchEvent.apply(this, args);
      }
    },
    handle: function () {
      return enyo._handle.apply(this, arguments);
    }
  });
  
}());