(function() {

  var collection = enyo.kind({
    name: "enyo.Collection",
    kind: "enyo.Extension",
    extendFrom: "Backbone.Collection",
    target: "_collection",
    
    _collection: null,
    
    _properties: [
      "url"
    ],
    
    published: {
      model: null,
      content: null,
      length: 0,
      collectionProperties: null,
      url: null,
      status: 0x00
    },
    
    statics: {
      OK: 0x00,
      LOADING: 0x01,
      ERROR: 0x02
    },
    
    constructor: function () {
      this.inherited(arguments);
      var ms = this._get("model"), m, b = this._base,
          p = this._get("collectionProperties") || {},
          adtl = {};
      if (enyo.isString(ms)) m = this.model = enyo._getPath(ms);
      if (!m) enyo.error("enyo.Collection: cannot find model " + ms);
      m = new m;
      b = b.extend(enyo.mixin({model: m.model}, p));
      enyo.forEach(this._properties, function (prop) {
        adtl[prop] = this[prop];
      }, this);
      b = b.extend(adtl);
      this._collection = new b;
      this.setupObservers();
    },
    
    fetch: function (options) {
      options = options? options: {};
      var cb = enyo.bind(this, this.didFetch, options.success);
      options.success = cb;
      options.error = enyo.bind(this, this.didError, options.error);
      this.set("status", collection.LOADING);
      this._collection.fetch(options);
    },
    
    didFetch: function (callback) {
      this.stopNotifications();
      this.set("content", this._collection.models);
      this.set("length", this._collection.length);
      this.set("status", collection.OK);
      this.startNotifications();
      if (callback && enyo.isFunction(collback))
        callback.apply(this, enyo.toArray(arguments).slice(1));
    },
    
    didError: function (callback) {
      this.set("status", collection.ERROR);
      if (callback && enyo.isFunction(callback))
        callback.apply(this, enyo.toArray(arguments).slice(1));
    },
    
    didAdd: function (model, collection) {
      this.stopNotifications();
      this.set("content", collection.models);
      this.set("length", collection.length);
      this.startNotifications();
    },
    
    didRemove: function (model, collection, params) {
      var c = this.content;
      this.stopNotifications();
      this.content = collection.models;
      this.set("length", collection.length);
      this.startNotifications();
      this.notifyObservers("content", c, this.content);
    },
    
    didChange: function (model, options) {
      var c = this.content;
      this.stopNotifications();
      this.content = model.collection.models;
      this.set("length", model.collection.length);
      this.startNotifications();
      this.notifyObservers("content", c, this.content);
    },
    
    didReset: function (collection, options) {
      var c = this.content;
      this.stopNotifications();
      this.content = collection.models;
      this.set("length", collection.models.length);
      this.startNotifications();
      this.notifyObservers("content", c, this.content);
    },
    
    setupObservers: function () {
      var c = this._collection;
      c.on("add", enyo.bind(this, this.didAdd));
      c.on("remove", enyo.bind(this, this.didRemove));
      c.on("change", enyo.bind(this, this.didChange));
      c.on("reset", enyo.bind(this, this.didReset));
    },
    
    methods: [
      "toJSON",
      "sync",
      "add",
      "remove",
      "push",
      "pop",
      "unshift",
      "shift",
      "slice",
      "getByCid",
      "at",
      "where",
      "sort",
      "pluck",
      "reset",
      "create",
      "parse",
      "clone",
      "chain",
      "without",
      "filter",
      "last"
    ]
  });
  
}());