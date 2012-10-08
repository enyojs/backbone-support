(function() {
  // just an attempt to skate by...
  var collection = enyo.kind({
    name: "enyo.Collection",
    kind: "enyo.Extension",
    extendFrom: "Backbone.Collection",
    target: "_collection",
    _collection: null,
    published: {
      model: null,
      content: null,
      length: 0,
      collectionProperties: null
    },
    statics: {
      OK: 0x00,
      LOADING: 0x01,
      ERROR: 0x02
    },
    constructor: function () {
      this.inherited(arguments);
      var ms = this._get("model"), m, b = this._base,
          p = this._get("collectionProperties") || {};
      if (enyo.isString(ms)) m = this.model = enyo._getPath(ms);
      if (!m) enyo.error("enyo.Collection: cannot find model " + ms);
      m = new m;
      b = b.extend(enyo.mixin({model: m.model}, p));
      this._collection = new b;
      this.setupObservers();
    },
    fetch: function (options) {
      options = options? options: {};
      var cb = enyo.bind(this, this._didFetch, options.success);
      options.success = cb;
      options.error = enyo.bind(this, this._didError, options.error);
      this.set("status", collection.LOADING);
      this._collection.fetch(options);
    },
    _didFetch: function (callback) {
      this.stopNotifications();
      this.set("content", this._collection.models);
      this.set("length", this._collection.length);
      this.set("status", collection.OK);
      this.startNotifications();
      if (callback && enyo.isFunction(collback))
        callback.apply(this, enyo.toArray(arguments).slice(1));
    },
    _didError: function (callback) {
      this.set("status", collection.ERROR);
      if (callback && enyo.isFunction(callback))
        callback.apply(this, enyo.toArray(arguments).slice(1));
    },
    _didUpdate: function (which, models, params) {
      var c = this._collection, ch;
      
      //console.log("_didUpdate: ", which, arguments);
      //console.log(this.get("content"), c.models, this.get("content") === c.models);
      
      this.stopNotifications();
      
      switch(which) {
        case "add":
          this.set("content", c.models);
          this.set("length", c.length);
          this.startNotifications();
          models.save();
          break;
        case "remove":
          ch = this.content;
          models.destroy();
          this.set("content", c.models);
          this.set("length", c.length);
          this.startNotifications();
          this.notifyObservers("content", ch, this.content);
          break;
        case "change":
          ch = this.content;
          this.set("content", c.models);
          this.set("length", c.length);
          this.startNotifications();
          this.notifyObservers("content", ch, this.content);
          //if (params.changes) {
          //  // special type of notification where parameters really
          //  // aren't important...
          //  for (ch in params.changes) {
          //    this.notifyObservers("change:" + ch);
          //  }
          //}
          
          break;
      }
    },
    setupObservers: function () {
      var c = this._collection, r = this._responder;
      c.on("add", enyo.bind(this, this._didUpdate, "add"));
      c.on("remove", enyo.bind(this, this._didUpdate, "remove"));
      c.on("change", enyo.bind(this, this._didUpdate, "change"));
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
      // "fetch",
      "create",
      "parse",
      "clone",
      "chain"
    ]
  });
}());