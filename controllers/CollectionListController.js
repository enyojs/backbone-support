
enyo.kind({
  name: "enyo.CollectionListController",
  kind: "enyo.CollectionController",
  bindings: [
    {from: "length", to: "owner.count", oneWay: true}
  ],
  handlers: {
    onSetupItem: "setupItem",
    ontap: "tapped",
    onreset: "didReset"
  },
  ownerChanged: function () {
    this.inherited(arguments);
    if (!this.owner) return;
    this.refreshBindings();
  },
  didReset: function () {
    if (!this.owner) return;
    this.owner.reset();
    return true;
  },
  lengthChanged: function () {
    if (!this.owner) return;
    // FIXME: this is obviously not ok...
    //if (this.owner.page === 0) this.owner.reset();
    //else this.owner.refresh();
    this.owner.refresh();
  },
  tapped: function (inSender, inEvent) {
  },
  
  // NOTE: unlike enyo.List/enyo.FlyweightRepeater where the
  // onSetupItem typically is interested in modifying the view
  // an enyo.CollectionList's onSetupItem is interested in the
  // underlying model...
  setupItem: function (inSender, inEvent) {
    // TODO: this should be checked for sanity as there was
    // no other obvious way to detect which children should
    // be examined for setup...
    
    var m = this.collection.at(inEvent.index), c, ch;

    // make sure the child view(s) were setup at least once
    c = this.prepareItems();
    
    // since each row can potentially have multiple children...
    while (c.length) {
      ch = c.shift();
      ch.controller.set("model", m);
      ch.syncBindings();
    }
  },
  prepareItems: function () {
    var c = this.getTargets(), i = 0, $c;
    if (!this._itemsPrepared) {
      for (; i < c.length; ++i) {
        $c = c[i];
        if (!$c.isCollectionRowProperties) {
          $c.extend(enyo.CollectionRowProperties);
          $c._setup();
          $c._setupBindings();
          $c.notifyObservers("controller", null, $c.controller);
        }
      }
      this._itemsPrepared = true;
    }
    return enyo.clone(c);
  },
  getTargets: function () {
    return this._targets || (this._targets = this.findTargets());
  },
  findTargets: function () {
    var o = this.owner;
    if (!o) return [];
    return enyo.filter(enyo.only(enyo.pluck("name", o.kindComponents), o.$),
      function (item) {return item.controller && item.controller.isModelController});
  }
});