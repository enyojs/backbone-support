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
    // grab the correct items, these are uninstanced control definitions
    // we have no idea what information they contain only that we need
    // to be able to find them once they are created
    var items = this.get("items"), ctrs = [];
    // create a unique id for each of them that we can use to find later
    enyo.forEach(items, function (item) {
      item._listId = enyo.uid("_list");
      ctrs.push(item._listId);
    });
    // do the normal routine and assume children are being created
    this.inherited(arguments);
    // take the ids we created before and look through the references to
    // controls we created and only select those
    ctrs = enyo.only(ctrs, enyo.indexBy("_listId", this.controls));
    enyo.forEach(ctrs, function (ctr) {
      // apply the required functionality we need (mixin) to each of
      // these controls
      ctr.extend(enyo.CollectionRowMixin);
    });
    this.set("targets", ctrs);
  },
  //*@protected
  items: enyo.Computed(function () {
    return this.components && this.components.length? this.components: this.kindComponents;
  })
});
