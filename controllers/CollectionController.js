
//*@public
/**
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.CollectionController",
    
    //*@public
    kind: "enyo.ArrayController",
    
    //*@public
    collection: null,
    
    //*@public
    model: null,
    
    //*@public
    autoLoad: false,
    
    //*@public
    models: null,
    
    //*@public
    mixins: ["enyo.SelectionSupport", "enyo.CollectionArraySupport"],
    
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    _last_collection: null,
    //*@protected
    _last_initialized: null,
    
    // ...........................
    // COMPUTED PROPERTIES

    //*@public
    /**
        Override this computed property to return any filtered
        content.
    */
    data: enyo.Computed(function (data) {
        return this.models;
    }, "models", "model", {cached: true}),
    
    // ...........................
    // PUBLIC METHODS
    
    //*@public
    load: function (options) {
        var col = this.collection;
        options = options || {};
        options.success = enyo.bind(this, this.collectionDidLoad);
        if (!col) return false;
        else {
            return col.fetch.call(col, options);
        }
    },
    
    //*@public
    fetch: function (options) {
        return this.load.apply(this, arguments);
    },
        
    //*@public
    on: function (event, fn) {
        var col = this.collection;
        if (!col) return false;
        else return col.on.apply(col, arguments);
    },
    
    //*@public
    off: function (event, fn) {
        var col = this.collection;
        if (!col) return false;
        else return col.off.apply(col, arguments);
    },
    
    // ...........................
    // PROTECTED METHODS
    
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

    //*@protected
    collectionChanged: function () {
        this.findAndInstance("collection");
    },
    
    //*@protected
    collectionFindAndInstance: function (ctor, inst) {
        var last = this._last_collection;
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
                    this.set("models", []);
                    this.startNotifications();
                }
                return;
            }
        }
            
        if (last) this.releaseCollection(last);
        this._last_collection = inst;
            
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
        
        if (inst) this.dispatchBubble("collectionchanged", {}, this);
    },
    
    //*@protected
    ownerChanged: function () {
        if (!this.collection) this.collectionChanged();
        if (this.collection && !this.collection.model && this.model) {
            this.collection.set("model", this.model);
        }
        return this.inherited(arguments);
    },
    
    //*@protected
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
    
    //*@protected
    releaseCollection: function (collection) {
        var responders = this.responders;
        var key;
        // if we couldn't find one, nothing to do
        if (!collection) return;
        for (key in responders) collection.off(key, responders[key]);  
        if (collection.controllers) {
            delete collection.controllers[this.id];
        }
        this._last_initialized = null;
    },
    
    //*@protected
    initCollection: function (collection) {
        // we need to initialize 
        var responders = this.responders;
        var key;
        var time = enyo.bench();
        var last = this._last_initialzed;
        // if we don't have an id we were called prematurely and
        // need to do nothing at this point
        if (!this.id) return;
        if (collection.controllers) {
            if (collection.controllers[this.id]) {
                if (last === collection.controllers[this.id]) return;
            }
        }
        
        for (key in responders) {
            if (!responders.hasOwnProperty(key)) continue;
            // using the backbone api we add our listeners
            collection.on(key, responders[key]);
        }
        // we now track the last time we initialized the collection
        // on the collection with our id for comparison purposes
        if (!collection.controllers) collection.controllers = {};
        collection.controllers[this.id] = time;
        this._last_initialized = time;
        this.stopNotifications();
        this.set("length", collection.length);
        this.set("models", collection.models, true);
        this.startNotifications();
    },
    
    //*@protected
    collectionDidLoad: function () {
        this.dispatchBubble("didload", {}, this);
    },
    
    //*@protected
    collectionDidChange: function (model) {
        var changeset = {};
        var idx = this.indexOf(model);
        changeset[idx] = model;
        this.dispatchBubble("didchange", {values: changeset}, this);
        this.notifyObservers("model", null, model);
    },
    
    //*@protected
    collectionDidAdd: function (model, collection, options) {
        var changeset = {};
        var idx = this.indexOf(model);
        changeset[idx] = model;
        this.stopNotifications();
        this.set("length", collection.length);
        this.set("models", collection.models, true);
        this.startNotifications();
        this.dispatchBubble("didadd", {values: changeset}, this);
    },
    
    //*@protected
    collectionDidRemove: function (model, collection, options) {
        var changeset = {removed: {}, changed: {}};
        var idx = options.index;
        var len = collection.length;
        changeset.removed[idx] = model;
        for (idx+=1; idx < len; ++idx) changeset.changed[idx] = collection.models[idx];
        this.stopNotifications();
        this.set("length", collection.length);
        this.set("models", collection.models, true);
        this.startNotifications();
        this.dispatchBubble("didremove", {values: changeset.removed}, this);
        if (idx > options.index) {
            this.dispatchBubble("didchange", {values: changeset.changed}, this);
        }
    },
    
    //*@protected
    collectionDidDestroy: function (model, collection, options) {
        var changeset = {};
        var idx = options.index;
        changeset[idx] = model;
        this.stopNotifications();
        this.set("length", collection.length);
        this.set("models", collection.models, true);
        this.startNotifications();
        this.dispatchBubble("diddestroy", {values: changeset}, this);
    },
    
    //*@protected
    collectionDidReset: function (collection, options) {
        options.values = options.previousModels || [];
        this.stopNotifications();
        this.set("length", collection.length);
        this.set("models", collection.models, true);
        this.startNotifications();
        this.dispatchBubble("didreset", options, this);
    },
    
    //*@protected
    destroy: function () {
        var last = this._last_collection;
        if (last) this.releaseCollection(last);
        this._last_collection = null;
        this.collection = null;
        this.responders = null;
        this.model = null;
        this.inherited(arguments);
    }
    
});
