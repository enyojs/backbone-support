//*@public
/**
   A special _enyo.Mixin_ used by _enyo.CollectionRepeater_ and
  _enyo.CollectionList_ to apply certain properties to row controls.
*/
enyo.Mixin({
  //*@protected
  name: "enyo.CollectionRowMixin",
  //*@protected
  initAutoBindings: function () {
    var c = this.controller, ctrs = this.get("bindableControls");
    if (!c) return;
    enyo.forEach(ctrs, function (ch) {
      var p = ch.bindProperty, t = this.getBindTargetFor(ch);
      this.autoBinding({source: c, from: p, target: ch, to: t});
    }, this);
  },
  //*@protected
  initMixin: function () {
    // first make sure we have a controller
    if (!this.controller) {
      // this will fire the correct notifications to
      // properly setup the controller, and our responder
      // and we won't need to call initAutoBindings
      this.set("controller", "enyo.ModelController");
    } else this.initAutoBindings();
  },
  //*@protected
  destroyMixin: function () {
    this.clearAutoBindings();
  },
  //*@protected
  getBindTargetFor: function (inControl) {
    var c = inControl, r = c.get("bindTarget");
    if (!r) r = ".content";
    r = r[0] === "."? r: "." + r;
    return r;
  },
  //*@protected
  autoBinding: function () {
    var b = this.binding.apply(this, arguments);
    b.isAutoBinding = true;
    return b;
  },
  //*@protected
  autoBindings: enyo.Computed(function () {
    return enyo.filter(this._bindings, function (b) {return b.isAutoBinding === true});
  }),
  //*@protected
  controllerChanged: function () {
    this.inherited(arguments);
    this.clearAutoBindings();
    this.initAutoBindings();
  },
  //*@protected
  clearAutoBindings: function () {
    var a = this.get("autoBindings"), b;
    while (a.length) {
      b = a.shift();
      b.destroy();
    }
  },
  bindableControls: enyo.Computed(function () {
    return enyo.filter(this.controls, function (ch) {
      return ch.bindProperty;
    });
  })
});
