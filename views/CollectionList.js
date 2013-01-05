
//*@public
/**
    The _enyo.CollectionList_ is like an _enyo.List_ except it
    is designed to work with _enyo.CollectionController_s and
    Backbone.Collections out of the box. It also differs in that
    it depends on bindings to setup row data. Build your row (view)
    with the auto-binding flags on components that need a property
    bound.
*/
enyo.kind({
    name: "enyo.CollectionList",
    kind: "enyo.List",
    // support for multiselection
    multiselect: false,
    //@protected
    mixins: ["enyo.CommonCollectionViewMixin"],
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
    }
});
