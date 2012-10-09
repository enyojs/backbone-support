enyo.kind({
  name: "enyo.ModelController",
  kind: "enyo.Controller",
  published: {
    model: null,
    attributes: null
  },
  constructor: function (inProps) {
    this.model = inProps.model;
    this.inherited(arguments);
  },
  create: function () {
    this.inherited(arguments);
    this.modelChanged();
  },
  
  
  // TODO: this entire thing is sketchy...it needs to be clearly defined
  // how the events are interpreted from backbone, with the apparent
  // `changed` event fix in their commit 205307a8569f93c3da7f5e1902943d36752d1efc
  // it might be possible to do this and NOT have to fake event updates as
  // is being done in such an ugly fashion now
  modelChanged: function () {
    var i = 0, attrs, attr, m = this.model, ch = {};
    if (!m || this._lastModel === this.model) {
      return;
    }
    this._lastModel = this.model;
    attrs = this.attributes = enyo.keys(m.attributes);
    for (; i < attrs.length; ++i) {
      attr = attrs[i];
      this[attr] = enyo.Computed(enyo.bind(this, function (inAttr, inValue) {
        if (arguments.length === 2) {
          //console.log("saving", inAttr, inValue);
          m.save(inAttr, inValue, {wait: true});
          //m.set(inAttr, inValue);
          return this;
        } else return m.get(inAttr);
      }, attr));
    }
    
    // TODO: implement individual observers based on computed
    // properties with a defined callback memoizing the properties
    // to automatically fire the `notifyObservers`...
    m.on("change", enyo.bind(this, this._didUpdate));
    m.on("destroy", enyo.bind(this, this._didDestroy));
    
    // this is triggering an initial update of the controller...
    for (i = 0; i < attrs.length; ++i) {
      ch[attrs[i]] = true;
    }
    m.changed = ch;
    this._didUpdate(m);
  },
  _didUpdate: function (model) {
    var c, ch, params = model.changed;
    c = enyo.keys(params);
    if (c && c.length > 0) {
      while (c.length) {
        ch = c.shift();
        //console.log("model: _didUpdate ", ch, model.get(ch), model.cid);
        this.notifyObservers(ch, this.get(ch), model.get(ch));
      }
    }
  },
  _didDestroy: function () {
    this.destroy();
  },
  destroy: function () {
    var m = this.model;
    if (m) {
      m.off("change", enyo.bind(this, this._didUpdate));
      m.off("destroy", enyo.bind(this, this._didDestroy));
    }
    this.model = null;
    this.inherited(arguments);
  }
});