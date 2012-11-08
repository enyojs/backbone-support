// just an attempt to skate by...
enyo.kind({
  name: "enyo.Model",
  kind: "enyo.Extension",
  extendFrom: "enyo.Backbone.Model",
  
  // TODO: this is tricky...if their API changes this
  // may no longer make sense
  set: function () {
    if (!enyo.isString(arguments[0])) return this._stored.set.apply(this, arguments);
    else return this.inherited(arguments);
  }
});
