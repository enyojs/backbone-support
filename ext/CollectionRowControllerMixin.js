
//*@public
/**
    _enyo.CollectionRowControllerMixin_ is a special mixin designed
    to aid supporting flyweight pattern rows used in _enyo.CollectionList_s.
*/
enyo.Mixin({
    //*@protected
    name: "enyo.CollectionRowControllerMixin",
    // we are particularly interested in these events because
    // we need to grab them before the view or the list-controller
    // does - since we need to prepare the row in the list and then
    // release the original event as if nothing ever happened
    initMixin: function () {
        var orig = this.originalHandlers = this.handlers;
        var handlers = this.handlers = {
            // we use ontap as opposed to click because ontap will
            // always come through first
            ontap: "tapped"
        };
        enyo.mixin(handlers, orig);
    },
    // since we are waiting for the abstraction of selection support
    // for flyweight repeaters we have to fill in the gaps for now, the
    // ok part is it is handled automatically now, the bad part is it
    // cannot be overridden easily
    tapped: function (sender, event) {
        var model = this.model;
        var collection;
        var idx;
        if (!model) return false;
        collection = model.collection;
        if (!collection) return false;
        idx = collection.indexOf(model);
        // without making this too hairy we go ahead and bubble another
        // synchronous event up to the list's controller to make sure
        // we prepare the correct row and it will also handle making sure
        // any other active row is locked first
        this.bubbleUp("onpreparerow", {index: "number" === typeof event.index?
            event.index: idx}, this);
        //return true;
    },
    
    didDestroy: function () {
        // turns out this is pretty easy
        this.releaseModel();
        this.model = null;
        // the current model will have also been the reference
        // to our `lastModel` so we clear that as well
        this.lastModel = null;
        // we set our owners controller (this controller) to null
        // so its destructor will not loop back on us which is
        // its default
        this.owner.controller = null;
        this.owner.destroy();
        this.destroy();
    },
});
