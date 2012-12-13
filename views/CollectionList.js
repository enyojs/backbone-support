
//*@public
/**
*/
enyo.kind({
    name: "enyo.CollectionList",
    kind: "enyo.List",
    //*@public
    /**
        The default expected controller _kind_ for
        enyo.CollectionList is the enyo.CollectionListController.
        There are plenty of scenarios though where you might
        want to share content already being proxied from another
        enyo.CollectionController or enyo.Collection itself. You
        can set this property to point to any subclass of
        enyo.CollectionController and the list will automatically
        figure out what it needs to do.
    */
    controller: "enyo.CollectionListController",
    /**
        You can provide an enyo.Collection _kind_ and it will be
        used with your given controller _as long as the controller
        does not have another _collection_ defined. This is a fallback
        but allows for a custom list to be thrown up without having
        to subclass the controller to know what kind of _collection_
        to use.
    */
    collection: null,
    /**
        If the collection that is used for this list does not have
        a model kind defined you can set this property as if it were
        on the collection.
    */
    model: null,
    //*@protected
    /** 
        Overloaded controllerChanged to handle the various
        scenarios that can arise from the various ways this
        particular _kind_ can be created.
    */
    controllerChanged: function () {
        this.findAndInstance("controller", function (ctor, inst) {
            var other;
            // if we don't have an instance that means there was
            // an attempt to use a subclass that could not be found
            if (!(ctor || inst)) {
                return enyo.error("enyo.CollectionList: request for " +
                    this.controllerName + " but it could not be found");
            }
            // we allow other types of collection controllers to be
            // assigned here, but we do need to figure out what kind
            // we have
            if (!(inst instanceof enyo.CollectionListController)) {
                // great but we need that kind so we'll go ahead
                // and create it
                other = inst;
                ctor = enyo.CollectionListController;
                inst = this.controller = new ctor();
                inst.set("owner", this);
            } else {
                // ok it was so lets make sure its owner is set to us
                inst.set("owner", this);
            }
            if (other) {
                // we need to figure out if the other controller is either
                // a collection controller or collection, either one will
                // be useable
                if ((other instanceof enyo.CollectionController) ||
                    (other instanceof enyo.Collection)) {    
                    // ok we will assign our collection property to this
                    // instance and let the controller choose it as its
                    // option
                    inst.set("collection", other);
                } else {
                    // this is a problem because we don't know what we can
                    // do with this object that was handed to us
                    return enyo.error("enyo.CollectionList: unknown kind used " +
                        "as controller or collection type, must subclass " +
                        "enyo.Collection or enyo.CollectionController");
                }
            }
        });
    },
    /**
        We need to initialize our components in the normal way
        with some slightly added behavior. We have to make sure
        we can find the original components that our controller
        will need regardless of whether we were subclassed or
        inlined in an components block.
    */
    initComponents: function () {
        // use our computed property to get the correct original
        // pre-instanced components
        var items = this.get("items");
        // placeholder for the array of items we're going to need
        // again to map to our target children
        var controls = [];
        // reused variable for mixins in each item
        var mixins;
        // make sure to map each entry with a unique identifier
        // and that they know to use the correct mixin type
        enyo.forEach(items, function (item) {
            item._listId = enyo.uid("_list");
            // keep track of these id's for later
            controls.push(item._listId);
            // if there are other mixins we preserve them
            // usually not the case but just making sure
            mixins = item.mixins || [];
            mixins.push("enyo.CollectionRowMixin");
            item.mixins = mixins;
        });
        // lets do our normal setup now
        this.inherited(arguments);
        // lets remap our newly instanced children
        controls = enyo.only(controls, enyo.indexBy("_listId", this.controls));
        // now that they are ready we store those so the controller
        // can use them
        this.set("targets", controls);
    },
    /**
        The computed property that will accurately return the components
        as were defined either in an inlined collection list or a
        subclass with children bearing isChrome: true.
    */
    items: enyo.Computed(function () {
        return this.components && this.components.length?
            this.components: this.kindComponents;
    })
});
