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
    /**
        To select a record pass in an index or a reference to the
        model. If multiselect is true, the index of the model will 
        be added to the selection array controller. If multiselect 
        is false, the previously selected model (if any) will be 
        deselected and the new model will be selected
        and its reference placed in the selection property.
    */
    select: function (model) {
        console.log("select", model, typeof model);
        var idx;
        if ("number" === typeof model) {
            idx = model;
            model = this.at(idx);
        } else idx = this.indexOf(model);
        // cannot select something that doesn't exist!
        if (!model) return false;
        if (this.multiselect === true) {
            // first make sure it isn't already selected
            if (model.get("selected") === true) return;
            // ok, make sure it isn't somehow in the selection array
            if (-1 !== this.selection.indexOf(idx)) return;
            this.selection.push(idx);
        } else {
            // if we have a previous selection we need to deselect it
            this.deselect();
            this.selection = model;
        }
        model.set({selected: true});
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
        console.log("deselect", model);
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
                selection.set({selected: false});
                this.selection = null;
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
            model.set({selected: false});
            return;
        }
        // if only single-selection is enabled test to see if the
        // model is actually the selected model
        if (selection === model) {
            // ok it was, set it to false, reset our selection
            model.set({selected: false});
            this.selection = null;
        }
    },
    //*@protected
    multiselectChanged: function () {
        if (this.multiselect === true) {
            if (!this.selection) {
                this.selection = new enyo.ArrayController();
            }
        }
    }
});
