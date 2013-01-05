
//*@public
/**
    The _enyo.ModelController_ kind is designed to proxy
    data from a single Backbone.Model instance. Views can
    bind to properties on this controller as if it was the
    model and those bindings will automatically update as
    the model is updated or swapped for another model.
*/
enyo.kind({
    //*@public
    name: "enyo.ModelController",
    //*@public
    kind: "enyo.Controller",
    //*@public
    model: null,
    //*@public
    lastModel: null,
    //*@protected
    statics: {
        modelControllerCount: 0
    },
    //*@protected
    constructor: function () {
        this.inherited(arguments);
        this.createResponders();
    },
    //*@protected
    create: function () {
        this.inherited(arguments);
        this.modelChanged();
        enyo.ModelController.modelControllerCount++;
    },
    //*@protected
    createResponders: function () {
        // we want to create and store these responders so that
        // we can cleanly remove them later when we need to release
        // the model
        var responders = this.responders || (this.responders = {});
        var model = this.model;
        if (model && responders.change && responders.destroy)
            this.releaseModel(model);
        // these methods will respond to the `change` and `destroy`
        // events of the underlying model (if any)
        responders["change"] = enyo.bind(this, this.didUpdate);
        responders["destroy"] = enyo.bind(this, this.didDestroy);
        if (model) this.initModel(model);
    },
    //*@protected
    modelChanged: function () {
        this.findAndInstance("model", function (ctor, inst) {
            // we will compare the new model against the previous
            // model if necessary
            var last = this.lastModel;
            var model;
            // if we don't have anything then we were reset but
            // that means we need to cleanup if we had one already
            if (!inst) {
                if (last) this.releaseModel(last);
                this.lastModel = null;
            } else {
                model = inst;
                this.lastModel = model;
                if (last) this.releaseModel(last);
                this.initModel(model);
            }
            this.notifyAll();
        });
    },
    //*@protected
    initModel: function (model) {
        // we need to initialize 
        var responders = this.responders;
        var key;
        for (key in responders) {
            if (!responders.hasOwnProperty(key)) continue;
            // using the backbone api we add our listeners
            model.on(key, responders[key]);
        }
    },
    //*@protected
    releaseModel: function (model) {
        // we need to releaseModel the model from our registered handlers
        var responders = this.responders;
        var key;
        // will use the parameter first or the `model` property, or
        // the `lastModel` property if the parameter isn't provided
        // and the `model` property is empty
        model = model || this.model || this.lastModel;
        // if we couldn't find one, nothing to do
        if (!model) return;
        for (key in responders) model.off(key, responders[key]);
    },
    //*@public
    /**
        When the underlying proxied model has changed this method is
        notified. It simply finds any of the changed attributes and
        notifies any observers/bindings of the change.
    */
    didUpdate: function (model) {
        var changes = model.attributes;
        var key;
        for (key in changes) {
            if (!changes.hasOwnProperty(key)) continue;
            // here for simplicity we access the previous value from
            // the backbone api of the model
            this.notifyObservers(key, model.previous(key), model.get(key));
        }
    },
    //*@public
    /**
        When a model is destroyed we need to catch the event and releaseModel
        it from our observers.
    */
    didDestroy: function () {
        // turns out this is pretty easy
        this.releaseModel();
        this.model = null;
        // the current model will have also been the reference
        // to our `lastModel` so we clear that as well
        this.lastModel = null;
        this.modelChanged();
    },
    //*@protected
    destroy: function () {
        // we want to releaseModel our references to the models and
        // free them of our observers is possible
        this.releaseModel();
        this.model = null;
        this.lastModel = null;
        // inherited
        this.inherited(arguments);
        // decrement our counter
        enyo.ModelController.modelControllerCount--;
    },
    //*@public
    get: function (prop) {
        // we overload this method to first call the method
        // on the model and if nothing is returned we use our
        // default
        var model = this.model;
        var ret;
        var path = prop.split(".");
        if (1 < path.length) {
            prop = path[0];
        }
        path = path.join(".");
        if (model && prop in model.attributes) {
            ret = model.get(path);
            // if it isn't undefined we have to hope that the null
            // or value came back for a reason
            if (enyo.exists(ret)) return ret;
        }
        // otherwise we simply return our normal getter
        return this.inherited(arguments);
    },
    //*@public
    set: function (prop, value) {
        // we overload this method to first call the method
        // on the model if it makes sense otherwise we call
        // our default setter
        var model = this.model;
        if (model) {
            // the only way we're certain we should be using the
            // models setter is if the `prop` parameter is actually
            // an object or if the string is on of the known attributes
            // of the models properties
            if ("object" === typeof prop || prop in model.attributes) {
                return model.set(prop, value);
            }
        }
        return this.inherited(arguments);
    },
    //*@protected
    /**
        This method attempts to find the correct target(s) and
        notify them of any/all the possible properties to force
        them to synchronize to the current values.
    */
    notifyAll: function () {
        // we will try and trick our bindings into firing by simply
        // triggering all of our registered observers since at this
        // moment it is the only way to be sure we get all bindings
        // not just our dispatch targets or owner
        var observers = this.observers;
        var handlers;
        var prop;
        for (prop in observers) {
            if (!observers.hasOwnProperty(prop)) continue;
            handlers = observers[prop];
            enyo.forEach(handlers, function (fn) {
                if ("function" === typeof fn) fn();
            }, this);
        }
    }
});