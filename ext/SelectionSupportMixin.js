//*@public
/**
    Applied to _enyo.CollectionControllers_ to be able to handle support
    for selection. It can manage multiselect and single-select implementations.
    It only stores the selected index and not a reference to the object.
*/
enyo.Mixin({
    name: "enyo.SelectionSupportMixin",
    /**
        Set this to true to enable multiple selection, it is false
        by default.
    */
    multiselect: false,
    /**
        If a record is selected, this property will be a reference
        to the model, if multiselect is enabled, this will be an
        array controller of any selected models.
    */
    selection: null,
    initMixin: function () {
        // register for when our owner is set to determine
        // if our multiselect status changes
        this.addObserver("owner", this.mixinOwnerChanged, this);
        if (this.createResponders) this.createResponders();
        //this.addObserver("collection", this.mixinCollectionChanged, this);
        //handlers["onmodelchange"] = "selectedModelChanged";
        //handlers["onSelectedChanged"] = "selectedModelChanged";
    },
    collectionDidChange: function (model) {
        var changed = model.changedAttributes() || {};
        if ("selected" in changed) {
            this.selectedModelChanged(model);
        }
        return this.inherited(arguments);
    },
    /**
        To select a record pass in an index or a reference to the
        model. If multiselect is true, the index of the model will 
        be added to the selection array controller. If multiselect 
        is false, the previously selected model (if any) will be 
        deselected and the new model will be selected
        and its reference placed in the selection property.
    */
    select: function (model) {
        var idx;
        if ("number" === typeof model) {
            idx = model;
            model = this.at(idx);
        } else idx = this.indexOf(model);
        // cannot select something that doesn't exist!
        if (!model) return false;
        if (this.multiselect === true) {
            // first make sure it isn't already selected
            if (model.get("selected") === true) {
                this.deselect(model);
                return;
            }
            // currently for multiselect if you select an already
            // selected row it will deselect it
            if (-1 !== this.selection.indexOf(idx)) {
                // ok we need to deselect the row instead of select
                this.deselect(idx);
                return;
            }
            this.selection.push(idx);
        } else {
            // if we have a previous selection we need to deselect it
            if (this.selection && this.selection === model) return;
            this.deselect();
            this.selection = model;
        }
        if (!model.get("selected")) {
            model.set({selected: true});
            this.bubbleUp("onselected", {model: model, index: idx}, this);
        }
        this.notifyObservers("selection", null, this.selection);
    },
    /**
        Deselect a model by passing the model reference in or an index
        to it. If multiselect is true, the models index will be removed
        from the selection array and have its selected state set to false. 
        If only single selection is permitted, and the model is the currently
        selected model (either by index or model reference) it will be 
        deselected. If deselect is called without passing in an index or 
        model reference it will automatically deselect the currently selected
        model if only single-selection is enabled. Otherwise it will to nothing.
    */
    deselect: function (model) {
        //  grab our current selection
        var selection = this.selection;
        // is multiselect enabled
        var multiselect = this.multiselect;
        // placeholder index
        var idx;
        // the placeholder for the index in the selection
        // if it exists
        var sel;
        // in cases where there is no parameter
        if (undefined === model) {
            // we can't do anything in this case if multiselect is
            // enabled
            if (multiselect === true) return;
            // we can really only deselect a selection if it
            // exists
            if (selection) {
                if (selection.get("selected")) selection.set({selected: false});
                this.selection = null;
                this.bubbleUp("ondeselected", {model: model, index: idx}, this);
                this.notifyObservers("selection", null, this.selection);
            }
            return;
        }
        // try and find the model by an index
        if ("number" === typeof model) {
            idx = model;
            model = this.at(idx);
        } else idx = this.indexOf(model);
        // if we can't find the requested model we can't
        // do anything
        if (!model) return;
        // if there isn't a selection of any sort regardless of
        // mode we can't do anything and its an elicit request
        if (!selection) return;
        // if multiselect mode is true then we need to see if the
        // model is even in the array of selected models
        if (multiselect === true) {
            // if this is true then it isn't selected in this selection
            if (-1 === (sel = selection.indexOf(idx))) return;
            // ok, remove it from the selection and set the selected
            // state to false
            selection.splice(sel, 1);
            if (!model.get("selected")) {
                model.set({selected: false});
            }
            this.bubbleUp("ondeselected", {model: model, index: idx}, this);
            this.notifyObservers("selection", null, this.selection);
        }
        // if only single-selection is enabled test to see if the
        // model is actually the selected model
        else if (selection === model) {
            // ok it was, set it to false, reset our selection
            if (model.get("selected")) {
                model.set({selected: false});
            }
            this.selection = null;
            this.bubbleUp("ondeselected", {model: model, index: idx}, this);
            this.notifyObservers("selection", null, this.selection);
        }
    },
    mixinOwnerChanged: function () {
        var owner = this.owner;
        if (owner) {
            this.set("multiselect", owner.multiselect);
        }
    },
    //*@protected
    multiselectChanged: function () {
        if (this.multiselect === true) {
            if (!this.selection) {
                this.selection = new enyo.ArrayController();
            }
        }
    },
    // this is terribly questionable to let every potential
    // collection controller attempt to do this - it appears
    // safe because its a nop if the model is already destroyed
    // and it forces a reset of selection to anyone listening
    // but...it still seems wrong, leaving it for now
    collectionDidReset: function (collection, options) {
        var models = options.previousModels || [];
        enyo.forEach(models, function (model) {
            model.destroy();
        });
        this.inherited(arguments);
    },
    selectedModelChanged: function (model) {
        var selected = model.get("selected");
        var multi = this.multiselect;
        if (true === multi) {
            if (true === selected) {
                this.select(model);
            } else this.deselect(model);
        } else {
            if (true === selected) {
                if (this.selection === model) return;
                else this.select(model);
            } else if (false === selected) {
                if (this.selection === model) {
                    this.deselect(model);
                }
            }
        }
        return true;
    },
    // TODO: need to add support for multiselect that when a model
    // is added to the selection set it has its index stored on the object
    // so in cases like these when we can't match it in the collection we
    // can still remove it from the selection set!
    modelRemoved: function (sender, event) {
        var model = event.model;
        var selection = this.selection;
        var multi = this.multiselect;
        if (multi) return false; // don't support this yet
        if (selection && model === selection) {
            this.deselect(model);
        }
    },
    
    releaseCollection: function (collection) {
        var multi = this.multiselect;
        if (true === multi) {
            // todo!
        } else this.deselect();
        this.inherited(arguments);
    }
});
