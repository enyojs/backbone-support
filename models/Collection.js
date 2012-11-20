(function() {

  //*@public
  /**
    _enyo.Collection_ is extended from _Backbone.js_'s _Backbone.Collection_.
    Any of the API from _Backbone.Collection_ is available on _enyo.Collection_
    plus any of the features of _enyo.Component_ (inherited from _enyo.Extension_).
    
    _enyo.CollectionControllers_ properly handle the events and _status_ of
    _enyo.Collection_.
  
    TODO: complete docs...
  */
  var collection = enyo.kind({
    name: "enyo.Collection",
    kind: "enyo.Extension",
    extendFrom: [
      {base: "enyo.Backbone.Collection", name: "collection"}
    ],
    mixins: ["enyo.MultipleDispatchMixin"],
    preserve: true,
    preserveAll: false,
    
    published: {
      status: 0x00
    },
    
    statics: {
      OK: 0x00,
      LOADING: 0x01,
      ERROR: 0x02
    },
    
    constructor: function () {
      var ms = this.model, m;
      if (enyo.isString(ms)) m = enyo.getPath(ms);
      if (!m) enyo.error("enyo.Collection: cannot find model " + ms);
      this.model = m;
      this.inherited(arguments);
      this.setupObservers();
    },
    
    fetch: function (options) {
      options = options? options: {};
      var cb = enyo.bind(this, this.didFetch, options.success);
      options.success = cb;
      options.error = enyo.bind(this, this.didError, options.error);
      this.set("status", collection.LOADING);
      this._stored.fetch.call(this, options);
    },
    
    didFetch: function (callback) {
      //console.log("didFetch", this, arguments);
      this.set("status", collection.OK);
      this.notifyObservers("models", null, this.models);
      this.notifyObservers("length", null, this.length);
      if (callback && enyo.isFunction(callback))
        callback.apply(this, enyo.toArray(arguments).slice(1));
    },
    
    didError: function (callback) {
      //console.log("didError", this, arguments);
      this.set("status", collection.ERROR);
      if (callback && enyo.isFunction(callback))
        callback.apply(this, enyo.toArray(arguments).slice(1));
    },
    
    didAdd: function (model, collection) {
      //console.log("didAdd", this, arguments);
      this.notifyObservers("models", null, this.models);
      this.notifyObservers("length", null, this.length);
      this.dispatchBubble("oncollectionadd", model);
    },
    
    didRemove: function (model, collection, params) {
      //console.log("didRemove", this, arguments);
      this.notifyObservers("models", null, this.models);
      this.notifyObservers("length", null, this.length);
      this.dispatchBubble("oncollectionremove", model);
    },
    
    didChange: function (model, options) {
      //console.log("didChange", this, arguments);
      this.notifyObservers("models", null, this.models);
      this.dispatchBubble("oncollectionchange", model);
    },
    
    didReset: function (collection, options) {
      //console.log("didReset", this, arguments);
      this.notifyObservers("length", null, this.length);
      this.notifyObservers("models", null, this.models);
      this.dispatchBubble("oncollectionreset");
    },
    
    setupObservers: function () {
      var c = this;
      c.on("add", enyo.bind(this, this.didAdd));
      c.on("remove", enyo.bind(this, this.didRemove));
      c.on("change", enyo.bind(this, this.didChange));
      c.on("reset", enyo.bind(this, this.didReset));
    }
  });
  
}());
