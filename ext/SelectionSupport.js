//*@public
/**
*/
enyo.createMixin({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.SelectionSupport",
    
    //*@public
    multiselect: false,
    
    //*@public
    selection: null,
    
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    _supports_selection: true,
    
    // ...........................
    // COMPUTED PROPERTIES
    
    // ...........................
    // PUBLIC METHODS
    
    //*@public
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
    
    //*@public
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
    
    // ...........................
    // PROTECTED METHODS
    
    //*@protected
    create: function () {
        if (this.createResponders) this.createResponders();
    },
    
    //@*protected
    collectionDidChange: function (model) {
        var changed = model.changedAttributes() || {};
        if ("selected" in changed) {
            this.selectedModelChanged(model);
        }
        return this.inherited(arguments);
    },
    
    

    
    //*@protected
    collectionDidReset: function (collection, options) {
        this.deselect();
        this.inherited(arguments);
    },
    
    //*@protected
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
    
    //*@protected
    // TODO: need to add support for multiselect that when a model
    // is added to the selection set it has its index stored on the object
    // so in cases like these when we can't match it in the collection we
    // can still remove it from the selection set!
    collectionDidRemove: function (model, collection, options) {
        if (this.selection && this.selection === model) {
            this.deselect();
        }
        this.inherited(arguments);
    },
    
    //*@protected
    releaseCollection: function (collection) {
        var multi = this.multiselect;
        if (true === multi) {
            // todo!
        } else this.deselect();
        this.inherited(arguments);
    }
    
    // ...........................
    // OBSERVERS

});
