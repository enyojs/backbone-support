
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
    // this will store the reference of the last model to
    // have its selected state set to true
    previouslySelected: null,
    // this stores the index of the previously active row
    // in the list
    previouslyPreparedIndex: null,
    handlers: {
        // list related events
        onSetupItem: "setupItem",
        onSelect: "setSelected",
        ontap: "tapped",
        // collection related events
        oncollectionreset: "didReset"
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
    modelChanged: function (collection, model) {
        this.log(model);
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
        if (this.owner) this.owner.refresh();  
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
        This method attempts to keep the selected state of the
        the current row up to date. This must happen before the
        tapped event is handled! Ordering of exection in this
        function is imperative.
        
        NOTE: This may force a render of these rows and this is
        why it must occur before the tapped event is handled.
    */
    setSelected: function (sender, event) {
        this.log(event.index, event.model.cid);
        // the model for the event coming in
        var model = event.model;
        // if for some reason there isn't one we have
        // nothing to do really
        if (!model) return;
        if (this.previouslySelected) {
            this.previouslySelected.set({selected: false});
            this.owner.lockRow(this.indexOf(this.previouslySelected));
        }
        model.set({selected: true});
        this.previouslySelected = model;
    },
    /**
        Will automatically prepare the row for interactivity
        and ensure that the previously interactice row is
        locked such that events can propagate as expected in
        the _view_ and fields will be usable as expected.
    */
    tapped: function (sender, event) {
        this.log(event.index);
        // the index of the previously prepared row
        var prev = this.previouslyPreparedIndex;
        // the current index for the row that needs to
        // be prepared
        var idx = event.index;
        // if they are the same do nothing
        if (prev === idx) return;
        // if they aren't we need to lock the previously
        // prepared row
        if (!isNaN(prev)) this.owner.lockRow(prev);
        // now prepare the current index
        this.owner.prepareRow(idx);
        // set our previously prepared index to the new index
        this.previouslyPreparedIndex = idx;
    }
});
