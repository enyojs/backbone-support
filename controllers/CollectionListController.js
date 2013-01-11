
//*@public
/**
    The _enyo.CollectionListController_ extends _enyo.CollectionController_
    and, unlike its super kind is designed to be owned by a _view_. It
    has awareness of the behaviors of _enyo.CollectionList_ and responds
    according to its events as well as the underlying _collection_'s. It
    is in the _controller_ that the actual _setupItem_ is manifested. It
    is not advisable to override this method without ensuring to call
    _this.inherited(arguments)_ from within that method. This makes use
    of the _auto-bindings_ features associated with _enyo.CollectionList_
    rows that implement the _enyo.CollectionRowMixin_.
*/
enyo.kind({
    //*@protected
    name: "enyo.CollectionListController",
    kind: "enyo.CollectionController",
    // this is a bound property from the owner/list to the
    // determined/calculated views for the row
    targets: null,
    // this stores the index of the previously active row
    // in the list
    previouslyPreparedIndex: null,
    handlers: {
        // list related events
        onSetupItem: "setupItem",
        // from the row controller
        onpreparerow: "prepareRow",
        // collection related events
        oncollectionreset: "didReset",
        onmodelchange: "modelChanged"
    },
    bindings: [
        // we keep a local copy of the targets that the view
        // already determined were the correct row components
        {from: "owner.targets", to: "targets"},
        // we create this binding such that the owner/list's count
        // is always current
        {from: "length", to: "owner.count"}
    ],
    /**
        If the collection was reset then the entire
        list needs to re-render.
    */
    didReset: function () {
        if (!this.owner) return;
        this.owner.reset();
    },
    /**
        This is a named handler coming from the collection
        for events on individual models.
    */
    modelChanged: function (collection, event) {
        var model = event.model;
        // TODO: models should already know their index
        // in the collection
        var idx = this.indexOf(model);
        if (!isNaN(idx) && this.owner) this.owner.renderRow(idx);
    },
    /**
        We want the list to update only what is necessary but
        properly run its calculations on sizing and scroll position
        so we're forced to refresh whenever the length property
        changed in the collection.
    */
    lengthChanged: function () {
        var owner = this.owner;
        var len = this.length;
        if (len && enyo.exists(owner)) owner.refresh();
    },
    /**
        Set up the rows auto bindings if they exist.
    */
    setupItem: function (sender, event) {
        // the current model at the row's index
        var model = this.at(event.index);
        // all children with auto bound properties for
        // this row
        var targets = enyo.clone(this.get("targets"));
        // a placeholder for any child
        var child;
        // iterate over the children and set the current
        // model on their model controller, this will
        // automatically refresh bindings
        while (targets.length) {
            child = targets.shift();
            child.controller.set("model", model);
        }
    },
    /**
        If an event dispatched through us has an index property
        we decorate it by adding the correct model at that
        index.
    */
    decorateEvent: function (name, event, sender) {
        // placeholder for the model if we need it
        var model;
        // call the inherited method to make sure it
        // is also decorated accordingly
        this.inherited(arguments);
        // find the model for this index and supply it to
        // the event object
        if (!isNaN(event.index)) {
            model = this.at(event.index);
            if (model) event.model = model
            // nullify the property so it is as least defined
            else event.model = null;
        }
    },
    /**
        Will automatically prepare the row for interactivity
        and ensure that the previously interactive row is
        locked such that events can propagate as expected in
        the _view_ and fields will be usable as expected. It
        can also accept a single Integer parameter instead of
        the event responder _sender_ and _event_.
    */
    prepareRow: function (sender, event) {
        // the index we're going to be looking at
        var idx;
        // the previously prepared row index
        var prev = this.previouslyPreparedIndex;
        // placeholder for our associated view
        var view = this.owner;
        // remember we have to handle the possible scenario
        // that this method was used like the lists own
        // prepareRow method
        if ("number" === typeof sender) idx = sender;
        // must be a normal event call
        else idx = event.index;
        // if there was a previously prepared row we need
        // to lock it
        if ("number" === typeof prev) {
            this.deselect();
            if (view) view.lockRow(prev);
        }
        if (view) {
            this.select(idx);
            view.prepareRow(idx);
            this.previouslyPreparedIndex = idx;
        }
        return true;
    }
});
