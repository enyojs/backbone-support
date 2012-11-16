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
  
  // NOTE: there's an option here, overload the controller
  // to know about the collection type, or provide it
  // to the list and have it hand-it off...
  controller: "enyo.CollectionListController",
  published: {
    collection: ""
  },
  //*@protected
  create: function () {
    var cl = this.get("collection"), c;
    this.inherited(arguments);
    c = this.get("controller");
    
    // let the controller deal with the setup on its own
    if (c && cl) c.set("collection", cl);
  },
  //*@protected
  initComponents: function () {
    var names = enyo.pluck("name", this.get("items")), ctrs;
    this.inherited(arguments);
    ctrs = enyo.only(names, enyo.indexBy("name", this.controls))
    enyo.forEach(ctrs, function (ctr) {
      ctr.extend(enyo.CollectionRowMixin);
    });
  },
  //*@protected
  items: enyo.Computed(function () {
    return this.components && this.components.length? this.components: this.kindComponents;
  })
});
