(function () {
  
  //*@protected
  // initialize the global app reference, when an enyo.app is
  // created it automatically replaces this global with a
  // reference to its self
  enyo._app = null;
  
  //*@public
  /**
    _MVC_ provides a pattern for a singleton _application_ instance.
    This shortcut, _enyo.app_ takes a hash of properties and applies
    them to a _enyo.Application_ class, creates the singleton instance,
    all while preserving properties that were already present in the
    namespace of the _application_.
    
    This allows for components of an _application_ to use its name as
    their namespace even though it does not yet exist.
  */
  enyo.app = function (inProps) {
    var n = enyo.global[inProps.name], r;
    r = (enyo.global[inProps.name] = new enyo.Application(inProps));
    if (n) for (var p in n) r[p] = n[p];
    return r;
  };
  
  
  /**
    _enyo.Application_ is designed to be a singleton instance. It is
    assumed to be the top-level parent of any views in the _application_.
    It automatically creates a namespace for JavaScript objects based
    on its _name_ property, automatically takes on a CSS classname of
    the form _name_-app and prepends this to assigned classes.
    
    @TODO: REVISIT
  */
  enyo.kind({
    name: "enyo.Application",
    //*@protected
    kind: "enyo.Control",
    //*@protected
    published: {
      store: false,
      router: false,
      controller: null
    },
    //*@protected
    _eventQueue: null,
    //*@proteced
    constructor: function (inProps) {
      var c = inProps.classes || "";
      this._eventQueue = [];
      c = inProps.name.toLowerCase() + "-app" + c;
      inProps.classes = c;
      enyo.mixin(this, inProps);
      this.inherited(arguments);
      enyo._app = this;
    },
    //*@protected
    create: function () {
      
      // this is an ugly hack that MUST BE RETHOUGHT OUT
      // but its necessary to move the normal create method
      // order until AFTER the `main` method is called...
      this._createArguments = arguments;
    },
    //*@protected
    start: function () {
      if (this.main && enyo.isFunction(this.main)) this.main();
      else if (window.main && enyo.isFunction (window.main)) main.call(this);
      
      // ...and...resume normal create method...
      this.inherited(this._createArguments);
      this.setup();
      this.renderInto(document.body);
      if (this.router) this.router.start();
    },
    //*@protected
    setup: function () {
      this.setupStore();
      this.setupRouter();
    },
    //*@protected
    setupStore: function () {
      var s = this.store;
      if (enyo.isString(s)) s = enyo.getPath(s);
      else return;
      if (!s) return console.warn("enyo.Application: could not " +
        "find the store `" + this.store + "`");
      s = this.store = new s();
      Backbone.sync = enyo.bind(s, function () {
        // allow for us to swap out sync at any time
        return s.sync.apply(this, arguments);
      });
    },
    //*@protected
    setupRouter: function () {
      var r = this.router, c = this.controller;
      if (enyo.isString(r)) r = enyo.getPath(r);
      else return;
      if (!r) return console.warn("enyo.Application: could not " +
        "find the router `" + this.router + "`");
      r = this.router = new r();
      r.set("controller", c);
    },
    //*@protected
    dispatchEvent: function () {
      if (!this.controller || !this.controller.handle) {
        // queue these...
        this._eventQueue.push(arguments);
        return;
      }
      if (!this.controller.handle.apply(this.controller, arguments))
        this.inherited(arguments);
    },
    //*@protected
    controllerChanged: function () {
      this.inherited(arguments);
      var q = this._eventQueue || [], args;
      while (q.length) {
        args = q.shift();
        this.dispatchEvent.apply(this, args);
      }
    },
    //*@protected
    handle: function () {
      return enyo._handle.apply(this, arguments);
    }
  });
  
}());
