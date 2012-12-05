enyo.kind({
  name: "enyo.CollectionController",
  kind: "enyo.ArrayController",
  published: {
    collection: null,
    autoLoad: false,
    status: null,
    length: 0,
    data: null,
    status: enyo.Collection.OK
  },
  mixins: ["enyo.SelectionSupportMixin"],
  handlers: {
    // this maps a specific change event and the model that
    // was changed to a responder, any subclass of this controller
    // can simply have a modelChanged function and expect that the
    // model is the one that changed, this is not the same as
    // collectionChanged or dataChanged or modelsChanged...
    oncollectionchange: "modelChanged",
    oncollectionadd: "modelAdded"
  },
  //*@protected
  /**
    In cases where a proxy controller is used, we need to
    do something out of the ordinary. We want to treat the
    proxied collection controller as the collection...
  */
  initProxyController: function () {
    var proxy = this.proxyController;
    this.collection = proxy;
    this.collectionChanged();
  },
  create: function () {
    this.inherited(arguments);
    this.collectionChanged();
    if (this.get("autoLoad")) enyo.run(this.load, this);
  },
  bindings: [
    {from: "collection.length", to: "length", oneWay: false},
    {from: "collection.models", to: "data", oneWay: false},
    {from: "collection.status", to: "status"},
    // we do this because other controllers may treat this controller
    // as if it were a collection (intended use-case)
    {from: "collection.models", to: "models", oneWay: false}
  ],
  collectionChanged: function () {
    this.findAndInstance("collection", function (ctor, inst) {
      // if neither we couldn't find it
      if (!(ctor || inst)) return;
      // if we have a constructor and an instance we created it
      // so we can own it
      if (inst) {
        inst.addDispatchTarget(this);
      }
      // either way lets refresh bindings
      this.refreshBindings();
    });
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
  },
  at: function () {
    return this.collection.at.apply(this.collection, arguments);
  },
  indexOf: function () {
    return this.collection.indexOf.apply(this.collection, arguments);
  }
});
