
//*@public
/**
    The _enyo.CollectionController_ kind is designed to help proxy
    a Backbone.Collection's data to a other enyo objects. It can be
    used to proxy one collection's data to many other collection
    controllers (e.g. _enyo.CollectionListController_).
*/
enyo.kind({
    name: "enyo.CollectionController",
    kind: "enyo.ArrayController",
    //*@public
    // a string or function for the desired collection
    collection: null,
    //*@public
    /**
        Auto-fire the load/fetch method of the underlying
        collection kind
    */
    autoLoad: false,
    // the current length of the collection
    length: 0,
    // the same reference to the array of models in the collection
    // but is typically used by other controllers when proxying
    // the data of this controller
    models: null,
    //*@protected
    lastCollection: null,
    //*@protected
    mixins: ["enyo.SelectionSupportMixin"],
    //*@protected
    constructor: function () {
        this.inherited(arguments);
        this.createResponders();
    },
    //*@protected
    create: function () {
        this.inherited(arguments);
        this.collectionChanged();
        if (this.get("autoLoad") === true) this.load();
    },
    //*@public
    /**
        Override this computed property to return any filtered
        content.
    */
    data: enyo.Computed(function () {
        return this.get("models");
    }, "models"),
    //*@protected
    collectionChanged: function () {
        this.findAndInstance("collection", function (ctor, inst) {
            var last = this.lastCollection;
            var model = this.model;

            if (!(ctor || inst)) {
                // we could not find the required collection so check
                // to see if we have an owner and if so check to see
                // if it has the collection definition
                if (this.owner) {
                    if (this.owner.collection) {
                        this.collection = this.owner.collection;
                        return this.collectionChanged();
                    }
                } else if (model) {
                    inst = this.collection = new Backbone.Collection();
                    if ("string" === typeof model) {
                        this.model = model = enyo.getPath(model);
                        if (!model) throw "enyo.CollectionController: cannot " +
                            "find the given model";
                    }
                    inst.model = model;
                }
                
                if (!inst) {
                    if (last) {
                        this.releaseCollection(last);
                        this.stopNotifications();
                        this.set("length", 0);
                        this.set("models", null);
                        this.startNotifications();
                    }
                    return;
                }
            }
            
            if (last) this.releaseCollection(last);
            this.lastCollection = inst;
            
            this.stopNotifications();
            this.initCollection(inst);
            
            if (this.owner) this.startNotifications();
            else {
                // otherwise we needed to be able to get all of the bindings refreshed
                // from the perspective of the dispatch target such that emitting a changed
                // event that assumes other things, such as, say if the length changed
                // was emitted prior to the data/models bindings refreshing - would cause
                // all sorts of issues
                enyo.forEach(this.dispatchTargets, function (target) {
                    target.stopNotifications();
                    target.refreshBindings();
                    target.startNotifications();
                }, this);
                // make sure to start these back up
                this.startNotifications();
            }
        });
    },
    
    //*@public
    /**
        See _enyo.Collection.fetch_
    */
    load: function (options) {
        var col = this.collection;
        options = options || {};
        options.success = enyo.bind(this, this.collectionDidLoad);
        if (!col) return false;
        else {
            return col.fetch.call(col, options);
        }
    },
    /**
        See _enyo.Collection.fetch_
    */
    fetch: function (options) {
        return this.load.apply(this, arguments);
    },
    /**
        See _enyo.Collection.reset_
    */
    reset: function (models, options) {
        var col = this.collection;
        if (!col) return false;
        else return col.reset.apply(col, arguments);
    },
    /**
        See _enyo.Collection.add_
    */
    add: function (model, options) {
        var col = this.collection;
        if (!col) return false;
        else return col.add.apply(col, arguments);
    },
    /**
        See _enyo.Collection.remove_
    */
    remove: function (model, options) {
        var col = this.collection;
        if (!col) return false;
        else return col.remove.apply(col, arguments);
    },
    /**
        See _enyo.Collection.at_
    */
    at: function (idx) {
        var col = this.collection;
        if (!col) return false;
        else return col.at.apply(col, arguments);
    },
    /**
        See _enyo.Collection.indexOf_
    */
    indexOf: function (model) {
        var col = this.collection;
        if (!col) return false;
        else return col.indexOf.apply(col, arguments);
    },
    
    on: function (event, fn) {
        var col = this.collection;
        if (!col) return false;
        else return col.on.apply(col, arguments);
    },
    
    off: function (event, fn) {
        var col = this.collection;
        if (!col) return false;
        else return col.off.apply(col, arguments);
    },
    
    //*@protected
    /**
        If the owner is changed we need to update accordingly.
    */
    ownerChanged: function () {
        if (!this.collection) this.collectionChanged();
        if (this.collection && !this.collection.model && this.model) {
            this.collection.set("model", this.model);
        }
        return this.inherited(arguments);
    },
    
    createResponders: function () {
        // we want to create and store these responders so that
        // we can cleanly remove them later when we need to release
        // the collection
        var responders = this.responders || (this.responders = {});
        var collection = "object" === typeof this.collection && this.collection;
        if (collection && responders.change)
            this.releaseCollection(collection);
        // these methods will respond to the `change` and `destroy`
        // events of the underlying model (if any)
        responders["change"] = enyo.bind(this, this.collectionDidChange);
        responders["remove"] = enyo.bind(this, this.collectionDidRemove);
        responders["add"] = enyo.bind(this, this.collectionDidAdd);
        responders["destroy"] = enyo.bind(this, this.collectionDidDestroy);
        responders["reset"] = enyo.bind(this, this.collectionDidReset);
        if (collection) this.initCollection(collection);
    },
    
    releaseCollection: function (collection) {
        var responders = this.responders;
        var key;
        // if we couldn't find one, nothing to do
        if (!collection) return;
        for (key in responders) collection.off(key, responders[key]);  
    },
    
    initCollection: function (collection) {
        // we need to initialize 
        var responders = this.responders;
        var key;
        for (key in responders) {
            if (!responders.hasOwnProperty(key)) continue;
            // using the backbone api we add our listeners
            collection.on(key, responders[key]);
        }
        this.stopNotifications();
        this.set("length", collection.length);
        this.set("models", collection.models, true);
        this.startNotifications();
    },
    collectionDidLoad: function () {
        this.dispatchBubble("oncollectionloaded", {}, this);
    },
    collectionDidChange: function (model) {
        this.dispatchBubble("onmodelchange", {model: model}, this);
    },
    collectionDidAdd: function (model, collection, options) {
        this.stopNotifications();
        this.set("length", collection.length);
        this.set("models", collection.models, true);
        this.startNotifications();
        this.dispatchBubble("oncollectionadd", {model: model}, this);
    },
    collectionDidRemove: function (model, collection, options) {
        this.stopNotifications();
        this.set("length", collection.length);
        this.set("models", collection.models, true);
        this.startNotifications();
        this.dispatchBubble("oncollectionremove", {model: model}, this);
    },
    collectionDidDestroy: function (model, collection, options) {
        this.stopNotifications();
        this.set("length", collection.length);
        this.set("models", collection.models, true);
        this.startNotifications();
        this.dispatchBubble("oncollectiondestroy", {model: model}, this);
    },
    collectionDidReset: function (collection, options) {
        this.stopNotifications();
        this.set("length", collection.length);
        this.set("models", collection.models, true);
        this.startNotifications();
        this.dispatchBubble("oncollectionreset", options, this);
    },
    
    destroy: function () {
        var last = this.lastCollection;
        if (last) this.releaseCollection(last);
        this.lastCollection = null;
        this.collection = null;
        this.responders = null;
        this.model = null;
        this.inherited(arguments);
    }
})