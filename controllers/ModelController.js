
enyo.kind({
    //*@public
    name: "enyo.ModelController",
    //*@public
    kind: "enyo.ObjectController",
    //*@public
    model: null,
    //*@protected
    statics: {
        modelControllerCount: 0
    },
    //*@public
    model: enyo.Computed(function (model) {
        if (enyo.exists(model)) {
            this.data = model;
        } else return this.get("data");
    }, "data"),
    //*@protected
    constructor: function () {
        this.inherited(arguments);
        this.createResponders();
    },
    //*@protected
    create: function () {
        this.inherited(arguments);
        enyo.ModelController.modelControllerCount++;
    },
    //*@protected
    createResponders: function () {
        // we want to create and store these responders so that
        // we can cleanly remove them later when we need to release
        // the model
        var responders = this.responders || (this.responders = {});
        var model = this.get("data");
        if (model && responders.change && responders.destroy)
            this.releaseData(model);
        // these methods will respond to the `change` and `destroy`
        // events of the underlying model (if any)
        responders["change"] = enyo.bind(this, this.didUpdate);
        responders["destroy"] = enyo.bind(this, this.didDestroy);
        if (model) this.initData(model);
    },
    //*@protected
    dataFindAndInstance: function (ctor, inst) {
        if (inst) {
            if (inst instanceof Backbone.Model) {
                this.initData(inst);
            }
        }
    },
    //*@protected
    initData: function (model) {
        // we need to initialize 
        var model = model || this.get("data");
        var responders = this.responders;
        var key;
        for (key in responders) {
            if (!responders.hasOwnProperty(key)) continue;
            // using the backbone api we add our listeners
            model.on(key, responders[key]);
        }
        this._last = model;
    },
    //*@protected
    releaseData: function (model) {
        // we need to releaseModel the model from our registered handlers
        var responders = this.responders;
        var key;
        // will use the parameter first or the `model` property, or
        // the `lastModel` property if the parameter isn't provided
        // and the `model` property is empty
        model = model || this.get("data") || this._last;
        // if we couldn't find one, nothing to do
        if (!model) return;
        for (key in responders) model.off(key, responders[key]);
        this._last = null;
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
        this.releaseData();
        // the current model will have also been the reference
        // to our `lastModel` so we clear that as well
        this._last = null;
        this.set("data", null);
    },
    //*@protected
    destroy: function () {
        // we want to releaseModel our references to the models and
        // free them of our observers is possible
        this.releaseData();
        this.stopNotifications(true);
        this.set("data", null);
        this.startNotifications(true);
        // inherited
        this.inherited(arguments);
        // decrement our counter
        enyo.ModelController.modelControllerCount--;
    },
    //*@public
    getDataProperty: function (prop) {
        var data = this.get("data");
        var ret;
        if (data && enyo.exists((ret = data.get(prop)))) {
            return ret;
        }
        return false;
    },
    //*@public
    setDataProperty: function (prop, value) {
        var data = this.get("data");
        var prev;
        // the model's _set_ API accepts an object/hash of properties to
        // set so that is a sure way to know we want to set this on the model
        // and not the controller - the only other way we can be sure is if
        // the property exists in the model attributes
        if (data && ("object" === typeof prop || prop in data.attributes)) {
            // we don't need to notify anything because the change on the model
            // will automatically trigger the change for us
            data.set(prop, value);
            return true;
        }
        return false;
    },
    //*@public
    /**
        Takes a string parameter and returns a boolean true|false
        depending on whether or not the parameter is an attribute
        of the model. If no model is present it will always return
        false.
    */
    isAttribute: function (prop) {
        var model = this.get("data");
        var attributes;
        if (model) {
            attributes = model.attributes;
            return attributes.hasOwnProperty(prop);
        }
        return false;
    },
    //*@protected
    notifyAll: function () {
        this.notifyAttributes();
    },
    //*@protected
    /**
        Calls the notification for any attributes of the models to
        trigger responders.
    */
    notifyAttributes: function () {
        var model = this.get("data");
        var attributes;
        var prop;
        if (model) {
            attributes = model.attributes;
            for (prop in attributes) {
                if (!attributes.hasOwnProperty(prop)) continue;
                this.notifyObservers(prop, null, model.get(prop));
            }
        }
    },
    
    //*@protected
    dataDidChange: enyo.Observer(function () {
        this.inherited(arguments);
    }, "data", "model")
});