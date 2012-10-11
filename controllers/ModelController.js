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
  
  modelChanged: function () {
    var i = 0, attrs, attr, m = this.model, ch = {};
    
    // if the model doesn't exist or is set to the same
    // model as before do not update anything
    if (!m || this.lastModel === m) return;
    
    // update our last model
    this.lastModel = m;
    
    // register for attribute changes on the model
    m.on("change", (this._updateResponder = enyo.bind(this, this.didUpdate)));
    
    // register for destroy notification
    m.on("destroy", (this._destroyResponder = enyo.bind(this, this.didDestroy)));
  },
  
  didUpdate: function (model) {
    var ch, params = model.changedAttributes();
    ch = params? enyo.keys(params): false;
    if (ch && ch.length) {
      this.stopNotifications();
      while (ch.length) {
        c = ch.shift();
        this.notifyObservers(c, model.previous(c), model.get(c));
      }
      this.startNotifications();
    }
  },
  
  didDestroy: function () {
    this.removeModel();
  },
  
  removeModel: function () {
    var m = this.model;
    if (m) {
      m.off("change", this._updateResponder);
      m.off("destroy", this._destroyResponder);
    }
    this.model = null;
  },
  
  destroy: function () {
    this.removeModel();
    this.inherited(arguments);
  },
  
  get: function () {
    var r;
    if (this.model) {
      r = this.model.get.apply(this.model, arguments);
      if (r) return r;
    }
    return this.inherited(arguments);
  },
  
  set: function (inProp, inValue) {
    if (this.model) {
      if (inProp in this.model.attributes) {
        this.model.set(inProp, inValue);
        return this;
      }
    }
    return this.inherited(arguments);
  }
});