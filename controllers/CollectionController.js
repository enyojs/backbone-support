enyo.kind({
  name: "enyo.CollectionController",
  kind: "enyo.ArrayController",
  published: {
    collection: null,
    autoLoad: false,
    status: null
  },
  create: function () {
    this.inherited(arguments);
    this.collectionChanged();
    if (this.get("autoLoad")) enyo.run(this.load, this);
  },
  collectionChanged: function () {
    var cs = this.get("collection"), c;
    if (enyo.isString(cs)) c = this.collection = enyo._getPath(cs);
    else c = this.collection = cs;
    if (!c) throw new Error("enyo.CollectionController: cannot find collection " + cs);
    this.clearBindings();
    if (enyo.isFunction(c)) c = this.collection = new c();
    this.setupBindings();
  },
  setupBindings: function () {
    var h, e, c = this.collection;
    
    this.binding({
      from: ".collection.length",
      to: ".length",
      oneWay: true
    });
    this.binding({
      from: ".collection.content",
      to: ".content"
    });
    this.binding({
      from: ".collection.status",
      to: ".status",
      oneWay: true
    });

  },
  
  load: function (options) {
    this.collection.fetch(options);
  },
  reset: function (models, options) {
    return this.collection.reset.apply(this.collection, arguments);
  },
  add: function (model, options) {
    return this.collection.add.apply(this.collection, arguments);
  },
  remove: function () {
    return this.collection.remove.apply(this.collection, arguments);
  }
});