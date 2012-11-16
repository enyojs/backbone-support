enyo.kind({
  name: "enyo.CollectionController",
  kind: "enyo.ArrayController",
  published: {
    collection: null,
    autoLoad: false,
    status: null,
    length: 0,
    content: null,
    status: enyo.Collection.OK
  },
  create: function () {
    this.inherited(arguments);
    this.collectionChanged();
    if (this.get("autoLoad")) enyo.run(this.load, this);
  },
  bindings: [
    {from: "collection.length", to: "length"},
    {from: "collection.models", to: "content"},
    {from: "collection.status", to: "status", oneWay: true}
  ],
  collectionChanged: function () {
    var cs = this.get("collection"), c;
    if (enyo.isString(cs)) c = this.collection = enyo.getPath(cs);
    else c = this.collection = cs;
    
    // TODO: probably don't want to throw this error...
    if (!c) throw new Error("enyo.CollectionController: cannot find collection " + cs);
    //if (!c) return false;
    if (enyo.isFunction(c)) c = this.collection = new c();
    
    c.owner = this;
    
    // call refresh as opposed to _setupBindings since that destroys
    // bindings we're relying on, this is a proper use-case for refresh
    this.refreshBindings();
  },
  load: function (options) {
    this.collection.fetch(options);
  },
  fetch: function () {
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
