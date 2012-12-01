
enyo.kind({
  name: "enyo.CollectionListController",
  kind: "enyo.CollectionController",
  bindings: [
    {from: "length", to: "owner.count"},
    {from: "owner.targets", to: "targets"}
  ],
  handlers: {
    onSetupItem: "setupItem",
    ontap: "tapped",
    oncollectionreset: "didReset"
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
    if (!this.owner || !this.collection) return;
    this.owner.refresh();
  },
  tapped: function (inSender, inEvent) {
  },
  modelChanged: function (inCollection, inModel) {
    var idx, data = this.data;
    idx = data.indexOf(inModel);
    this.owner.renderRow(idx);
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
    c = this.getTargets();
    // since each row can potentially have multiple children...
    while (c.length) {
      ch = c.shift();
      ch.controller.set("model", m);
      ch.refreshBindings();
    }
    return true;
  },
  getTargets: function () {
    return enyo.clone(this.targets);
  }
});
