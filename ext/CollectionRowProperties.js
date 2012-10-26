enyo.CollectionRowProperties = {
  _autoBindings: null,
  destroy: function () {
    var c = this.get("controller");
    if (c) c.destroy();
    this.controller = null;
    this._clearAutoBindings();
    //this.inherited(arguments);
    
    // TODO: THIS IS SO DUMB!!!!
    this.__proto__.destroy.call(this);
  },
  
  
  _initAutoBindings: function () {
    var c = this.get("controller"), ctr, bindProp, ch;
    if (!c) return;
    for (ch in this.$) {
      if (!this.$.hasOwnProperty(ch)) continue;
      ctr = this.$[ch];
      bindProp = ctr.bindProperty;
      if (!bindProp) continue;
      this._autoBinding({
        from: "." + bindProp,
        to: this.getBindTargetFor(ctr),
        source: c,
        target: ctr
      });
    }
  },
  syncBindings: function () {
    var a = this._autoBindings.concat(this._bindings || []), i = 0, b;
    for (; i < a.length; ++i) {
      b = a[i];
      if (b) b.sync(true);
    }
  },
  getBindTargetFor: function (inControl) {
    var r = inControl.get("bindTarget");
    if (!r) r = ".content";
    //return r[0] === "."? r: "." + r;
    r = r[0] === "."? r: "." + r;
    return r;
  },
  _controllerChanged: enyo.Observer(function () {
    this._clearAutoBindings();
    this._initAutoBindings();
  }, "controller"),
  _autoBinding: function () {
    var a = this._autoBindings || (this._autoBindings = []),
        b, args, props = {}, i = 0;
    args = enyo.toArray(arguments);
    for (; i < args.length; ++i) enyo.mixin(props, args[i]);
    b = new enyo.Binding({owner: this, autoConnect: true}, props);
    b.isAutoBinding = true;
    a.push(b);
    return b;
  },
  _clearAutoBindings: function () {
    var a = this._autoBindings, b;
    if (!a) return;
    while (a.length > 0) {
      b = a.shift();
      b.destroy();
    }
  },
  isCollectionRowProperties: true
};