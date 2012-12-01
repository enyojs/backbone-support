//*@public
/**
  _enyo.Model_ is extended from _Backbone.js_'s _Backbone.Model_. Any of
  the API from _Backbone.Model_ is available to this _enyo.Model_ with
  the advantage of being an _enyo.Component_ (inherited from _enyo.Extension_).

  TODO: complete docs...
*/
enyo.kind({
  name: "enyo.Model",
  kind: "enyo.Extension",
  extendFrom: [
    {base: "enyo.Backbone.Model", name: "model", preserve: true}
  ],
  //*@public
  get: function (prop) {
    // we want to test and see if the model returns a value
    // before defaulting to our built-in get method
    var r = this.stored["model"].get.apply(this, arguments);
    // the only way we know for sure it failed is if the result
    // is undefined, if it is null, we unfortunately need to
    // verify (this covers probably 90%+ of cases) that the
    // requested attribute isn't a known attribute that properly
    // returned a null
    if (r !== undefined) {
      return r;
    } else if (r === null) {
      if ((prop in this.attributes) && this.attributes[prop] === null)
        // ok, guess thats what it was supposed to be
        return r;
    }
    // use our default
    return this.inherited(arguments);
  },
  //*@public
  set: function (prop, val) {
    // we have to do two checks here to make sure we're setting
    // to the model appropriately
    // if the parameter adheres to Backbones most recent setter
    // API, it is a hash and is easy to detect
    if ("object" === typeof prop) {
      return this.stored["model"].set.apply(this, arguments);
    }
    // we assume it is a string but if the property is on the
    // attributes hash we know what it was trying to set
    if (prop in this.attributes) {
      return this.stored["model"].set.apply(this, arguments);
    }
    // use the default
    return this.inherited(arguments);
  }
});
