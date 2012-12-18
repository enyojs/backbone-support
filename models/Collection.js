
//*@public
/**
    _enyo.Collection_ is essentially a special wrapper around an
    array of a particular type of _enyo.Model_. _enyo.Collection_ is
    extended from Backbone.Collection (enyo.Backbone.Collection) and
    exposes both the default API of Backbone.Collection and enyo.Component.
    _enyo.Collection_ automatically exposes Backbone.Collection events
    through an accessible enyo-based event-API that is bindable and routed
    through _enyo.Controllers_ out of the box.
    
    See _enyo.CollectionController_
    See _enyo.Extension_
*/
enyo.kind({
    name: "enyo.Collection",
    kind: "enyo.Extension",
    //*@protected
    /** 
        We choose to extend the Backbone.Collection base-class that
        was reassigned by the MVC library upon inclusion, note that
        stored common-procedures are under the name "collection".
    */
    extendFrom: [
        {base: "enyo.Backbone.Collection", name: "collection"}
    ],
    mixins: ["enyo.MultipleDispatchMixin"],
    // this forces the extension to store common methods for the base
    // class (in this case enyo.Backbone.Collection) via the _stored_
    // object property
    preserve: true,
    // this means it will not store unique methods they will automatically
    // be added to the kind
    preserveAll: false,
    published: {
        // this status is exposed primarily for _enyo.CollectionController_
        status: 0x00
    },
    //*@public
    statics: {
        OK:         0x00,
        LOADING:    0x01,
        ERROR:      0x02,
        responders: ["add", "remove", "change", "reset", "destroy"],
        collectionCount: 0
    },
    //*@protected
    // this property eventually houses all of the registered listeners
    // on the underlying Backbone.Collection for cleanup
    collectionObservers: null,
    constructor: function () {
        this.modelChanged();
        this.inherited(arguments);
        this.setupCollectionObservers();
        enyo.Collection.collectionCount++;
    },
    modelChanged: function () {
        var model = this.model;
        // if we don't have a model, check our owner first
        if (!model || this.model === enyo.Backbone.Model) {
            if (this.owner) {
                if (this.owner.model) {
                    // ok, our owner has the model kind lets use that
                    this.model = this.owner.model;
                } else if (this.owner.owner) {
                    // if the controller doesn't lets see if the owner
                    // view has it defined there
                    if (this.owner.owner.model) {
                        // ok it was defined there instead so lets use
                        // that one
                        this.model = this.owner.owner.model;
                    }
                }
                // well lets make sure we found a model somewhere
                if (!this.model) {
                    enyo.warn("enyo.Collection: cannot find a model kind " +
                        "defined on the collection, controller or owner view " +
                        "defaulting to enyo.Model");
                    this.model = "enyo.Model";
                }
                // start over now that we know we have something
                return this.modelChanged();
            }
            // we can't do anything until we have an owner or our
            // model property is set -- this is a perfectly ok state
            // to be
            return;
        }
        if ("string" === typeof model) {
            model = this.model = enyo.getPath(model);
        }
        if ("function" !== typeof model) {
            throw "enyo.Collection: something is wrong, could not " +
                "find the constructor for the requested enyo.Model kind";
        }
    },
    //*@public
    /**
        Retrieve the underlying models via the implemented sync
        method as described in the Backbone.Collection documentation.
        Unless used outside the context of an _enyo.CollectionController_
        this method should rarely be executed arbitrarily but can
        easily be overloaded. Accepts a single parameter _options_ to
        be passed through to the Backbone.Collection's fetch method.
        
        The _options_ hash can contain a _success_ function to be called
        with a successful response and an _error_ function to be called
        on error.
    */
    fetch: function (options) {
        // check assignment of the options
        var opts = options? options: {};
        // the callback function for success
        var fn = enyo.bind(this, this.didFetch, opts.success);
        opts.success = fn;
        opts.error = enyo.bind(this, this.didError, opts.error);
        // update our status accordingly
        this.set("status", enyo.Collection.LOADING);
        this.stored["collection"].fetch.call(this, opts);
    },
    //*@protected
    /**
        This method is called when fetch was successful. If a callback
        was provided to the options in fetch it is the first parameter
        of this function call.
    */
    didFetch: function (fn) {
        this.set("status", enyo.Collection.OK);
        this.notifyObservers("models", null, this.models);
        this.notifyObservers("length", null, this.length);
        if ("function" === typeof fn) {
            // the success callback we accepted is not part of the
            // procedural parameters expected by the success function
            fn.apply(this, enyo.toArray(arguments).slice(1));
        }
    },
    /**
        On an error during fetch this method is executed as well as
        any error handler sent in the options to the original fetch
        call.
    */
    didError: function (fn) {
        this.set("status", enyo.Collection.ERROR);
        if ("function" === typeof fn) {
            // the success callback we accepted is not part of the
            // procedural parameters expected by the error function
            fn.apply(this, enyo.toArray(arguments).slice(1));
        }
    },
    /**
        When a model is added to the collection it is first absorbed
        by the collection and this responder is called. Dispatches a bubble
        for the _oncollectionadd_ event.
    */
    didAdd: function (model, collection, params) {
        this.notifyObservers("models", null, this.models);
        this.notifyObservers("length", null, this.length);
        this.dispatchBubble("oncollectionadd", {model: model, type: "oncollectionadd"});
    },
    /**
        When a model is removed from the collection this method
        handles the remove event. Dispatches a bubble for the
        _oncollectionremove_ event.
    */
    didRemove: function (model, collection, params) {
        this.notifyObservers("models", null, this.models);
        this.notifyObservers("length", null, this.length);
        this.dispatchBubble("oncollectionremove", {model: model, type: "oncollectionremove"});
    },
    /**
        When a model is destroyed the collection that owned it receives
        a _destroy_ event. This method will propagate a _oncollectiondestroy_
        event as well for observers in the controller layer.
    */
    didDestroy: function (model) {
        this.notifyObservers("models", null, this.models);
        this.notifyObservers("length", null, this.length);
        this.dispatchBubble("oncollectiondestroy", {model: model, type: "oncollectiondestroy"});
    },
    /**
        Whenever an individual record emits the _changed_ event
        this method will notify any listeners which model changed.
        Will bubble the _oncollectionchange_ event.
    */
    didChange: function (model, params) {
        var changed = model.changedAttributes();
        var prop;
        var eventName;
        this.notifyObservers("models", null, this.models);
        this.dispatchBubble("oncollectionchange", {model: model, type: "oncollectionchange"});
        // lets go a step further and emit a specific event
        // that can be listened for related to the attributes
        // that changed
        for (prop in changed) {
            if (!changed.hasOwnProperty(prop)) continue;
            eventName = enyo.format("on%.Changed", enyo.cap(prop));
            this.dispatchBubble(eventName, {
                model: model,
                value: changed[prop],
                type: eventName
            });
        }
    },
    /**
        Whenever the _reset_ method is called on the collection
        either directly or via the owner/controller it will force
        this event to be bubbled _oncollectionreset_ because it
        completely drops all models/records currently housed by the
        collection and replaces all of them at once.
    */
    didReset: function (collection, params) {
        this.notifyObservers("length", null, this.length);
        this.notifyObservers("models", null, this.models);
        this.dispatchBubble("oncollectionreset", {type: "oncollectionreset"});
    },
    /**
        This method is responsible for properly registering observers
        for the Backbone.Collection native events and distributing them
        properly in a way that _enyo.Components_ can respond to them.
    */
    setupCollectionObservers: function () {
        var observers = this.collectionObservers = {};
        enyo.forEach(enyo.Collection.responders, function (responder) {
            var name = "did" + enyo.cap(responder);
            var fn = this[name];
            if ("function" !== typeof fn) return;
            observers[responder] = fn = enyo.bind(this, fn);
            this.on(responder, fn);
        }, this);
    },
    /**
        Cleanup.
    */
    destroy: function () {
        var observers = this.collectionObservers;
        var responder;
        for (responder in observers) {
            this.off(responder, observers[responder]);
        }
        this.inherited(arguments);
        enyo.Collection.collectionCount--;
    },
    /**
        If the owner changed we want to make sure we have a model defined
        and if not go ahead and recheck for one.
    */
    ownerChanged: function () {
        this.modelChanged();
        return this.inherited(arguments);
    },
    /**
        Overloaded getter to support the appropriate api for backbone.
    */
    get: function (prop) {
        if ("string" !== typeof prop) {
            return this.stored["collection"].get.apply(this, arguments);
        } else return this.inherited(arguments);
    }
})