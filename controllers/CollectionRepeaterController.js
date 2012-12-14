
//*@public
/**
*/
enyo.kind({
    name: "enyo.CollectionRepeaterController",
    kind: "enyo.CollectionController",
    // handlers
    handlers: {
      onpreparerow: "prepareRow"  
    },
    render: function () {
        // if we do not have an owner we can't do anything
        if (!this.owner) return false;
        // we need to scope the views we create according to the
        // settings of our owner
        var view = this.owner;
        // we need to have our data
        var data = this.data;
        // our known length
        var len = this.length;
        // we need the rows of the view if any so we can reuse
        // them when possible
        var rows = view.get("rows");
        // we need a copy of the parameters to use for each row
        // we wind up generating
        // TODO: we HAVE to use a single view here as the row
        // later support can be added but it doesn't necessarily
        // make sense to support that scenario so instead of an
        // array the row definition is assumed to be the first
        // element in the components block - it can have as many
        // nested elements as it wants...
        var def = view.get("items")[0];
        // so the general logic is this to iterate over our dataset
        // and for any row that is already created/instanced we reuse
        // it and if not we create it and if when we're done we have
        // leftovers we destroy them
        // our iterator
        var idx = 0;
        // placeholder for a reference to the row-view
        var row;
        // placeholder for the record
        var record;
        for (; idx < len; ++idx) {
            // grab the record
            record = data[idx];
            // if we can't find an instanced row for this index of
            // the dataset we have to create one
            if (!(row = rows[idx])) {
                row = view.createComponent(def);
                // we need to render it so it has a display
                // to actually update
                row.render();
            }
            // now we have a row so we hand it the data for the record
            // and we should be done
            row.controller.set("model", record);
        }
        // now the final step is to make sure if have too many children
        // to go ahead and get rid of them for now
        if (idx < rows.length) {
            // grab all the leftovers
            rows = rows.slice(idx);
            // destroy them all
            enyo.forEach(rows, function (row) {row.destroy()});
        }
    },
    lengthChanged: function () {
        this.render();
    },
    prepareRow: function (sender, event) {
        var idx;
        var multiselect = this.multiselect;
        if ("number" === typeof sender) {
            idx = sender;
        } else idx = event.index;
        this.select(idx);
    }
});