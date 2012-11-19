enyo.kind({
  name: "enyo.ModelController",
  kind: "enyo.Controller",
  
  published: {
    model: null,
    attributes: null,
    lastModel: {}
  },
  
  isModelController: true,
  
  constructor: function (inProps) {
    if (inProps) this.model = inProps.model;
    this.inherited(arguments);
    
    if (!enyo.modelControllerCount) enyo.modelControllerCount = 1;
    else enyo.modelControllerCount++;
    
    //console.log("created an enyo.ModelController", enyo.modelControllerCount);
  },
  
  create: function () {
    this.inherited(arguments);
    this.modelChanged();
  },
  
  modelChanged: function () {
    var i = 0, attrs, attr, m = this.model, ch = {};
    // if the model doesn't exist or is set to the same
    // model as before do not update anything
    if (!m || this.lastModel.cid === m.cid) return;
    
    if (this.lastModel) this.removeModel(this.lastModel);
    
    // update our last model
    this.lastModel = m;
    
    // register for attribute changes on the model
    m.on("change", (this._updateResponder = enyo.bind(this, this.didUpdate)));
    
    // register for destroy notification
    m.on("destroy", (this._destroyResponder = enyo.bind(this, this.didDestroy)));
    
    // TODO: is this desirable here?
    this.owner.refreshBindings();
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
  
  removeModel: function (model) {
    var m = model || this.model;
    if (m && this._updateResponder && this._destroyResponder) {
      m.off("change", this._updateResponder);
      m.off("destroy", this._destroyResponder);
    }
    if (m === this.model) this.model = null;
  },
  
  destroy: function () {
    this.removeModel();
    this.inherited(arguments);
    enyo.modelControllerCount--;
    //console.log("just destroyed a model controller");
  },
  
  get: function () {
    var r;
    if (this.model) {
      r = this.model.get.apply(this.model, arguments);
      if (r !== undefined) return r;
    }
    return this.inherited(arguments);
  },
  
  set: function (inProp, inValue) {
    if (this.model && inProp && !enyo.isString(inProp) && (!inValue || (inValue && !enyo.isString(inValue)))) {
      this.model.set(inProp, inValue);
    } else {
      return this.inherited(arguments);
    }
  }
});
