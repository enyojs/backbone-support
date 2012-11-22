/**
  An adapted _enyo.List_ designed for use with _enyo.Collection_
  and _enyo.Controller_ natively also providing support for
  _enyo.Binding_. 
  
  It expects its controller to be of kind _enyo.CollectionListController_
  and can have a collection handed to it or let the controller handle
  the collection.
*/
enyo.kind({
  name: "enyo.CollectionList",
  kind: "enyo.List",
  controller: "enyo.CollectionListController",
  collection: null,
  create: function () {
    this.inherited(arguments);
    this.collectionChanged();
  },
  controllerChanged: function () {
    var ctrl, tmp;
    this.inherited(arguments);
    ctrl = this.controller;
    if (ctrl && !(ctrl instanceof enyo.CollectionListController)) {
      tmp = ctrl;
      ctrl = this.controller = new enyo.CollectionListController();
      ctrl.set("owner", this);
      this.collection = tmp;
    }
  },
  collectionChanged: function () {
    this.findAndInstance("collection", function (ctor, inst) {
      if (!(ctor || inst)) return;
      if (ctor || inst !== this.controller.collection) {
        this.controller.set("collection", inst);
      }
    })
  },
  //*@protected
  initComponents: function () {
    var names = enyo.pluck("name", this.get("items")), ctrs;
    this.inherited(arguments);
    ctrs = enyo.only(names, enyo.indexBy("name", this.controls));
    enyo.forEach(ctrs, function (ctr) {
      ctr.extend(enyo.CollectionRowMixin);
    });
  },
  //*@protected
  items: enyo.Computed(function () {
    return this.components && this.components.length? this.components: this.kindComponents;
  })
});
