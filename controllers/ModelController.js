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
    // TODO: is there a time/way this should be disabled?
    this.notifyAll();
  },
  
  didUpdate: function (model) {
    var ch, params = model.changedAttributes(), c;
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
  
  set: function (key, value) {
    // if the key is either a hash or included as an attribute of the model
    // then we assume it is a request to set it on the model
    if (this.model) {
      if ("string" !== typeof key || key in this.model.attributes) {
        // even though the api is different for each possibility the outcome
        // will be the same...
        return this.model.set(key, value);
      }
    }
    return this.inherited(arguments);
  },
  
  notifyAll: function () {
    var targets = this.get("dispatchTargets");
    if (this.owner && -1 === targets.indexOf(this.owner)) targets.push(this.owner);
    enyo.forEach(targets, function (target) {target.refreshBindings()});
  }
});
