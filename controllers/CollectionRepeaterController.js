
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
    render: function (idx) {
        // if we do not have an owner we can't do anything
        if (!this.owner) return false;
        // we need to scope the views we create according to the
        // settings of our owner
        var view = this.owner;
        // we need to have our data
        var data = this.get("data");
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
        // placeholder for a reference to the row-view
        var row;
        // placeholder for the record
        var record;
        // the idx is expected to be a number or a model
        if ("number" !== typeof idx) {
            // no idea what we're supposed to do with...whatever this is
            if ("object" !== typeof idx) return false;
            record = idx;
            idx = this.indexOf(record);
        } else record = data[idx];
        // if the index isn't valid...we can't do anything
        if (-1 === idx) return false;
        // try and reuse an existing row if possible
        if (!(row = rows[idx])) {
            row = view.createComponent(def);
            row.render();
        }
                
        // update the controller of the row so it will have the new data
        row.controller.set("model", record);
        /*
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
        */
    },
    //modelChanged: function (sender, event) {
    //    this.log();
    //    var model = event.model;
    //    var idx = this.indexOf(model);
    //    if (model && idx) this.render(idx);
    //},
    collectionChanged: function () {
        this.log(this.id, this.collection? this.collection.id: null);
        this.inherited(arguments);
        if (this.length) {
            // so the assumption here is that the collection already has
            // content so the default methods/responders won't trigger a
            // render, so lets render all the rows we have data for now
            for (var idx=0, len=this.length; idx<len; ++idx) this.render(idx);
            // go ahead and cleanup additional rows we might have
            this.prune();
        }
    },
    modelAdded: function (sender, event) {
        var model = event.model;
        var idx = this.indexOf(model);
        this.log(model.cid, idx);
        if (model && !isNaN(idx) && -1 !== idx) this.render(idx);
    },
    modelRemoved: function (sender, event) {
        this.log();
        var model = event.model;
        this.log(model.cid);
    },
    prune: function () {
        // we need to be able to compare the length of our known dataset
        // against the length of the number of rendered rows we have
        var len = this.length;
        // of course we need our actual owner
        var view = this.owner;
        // placeholder for rows should we be able to get them
        var rows;
        // if we have no owner view then we can't do anything
        if (!view) return;
        // grab the rows associated with our owner
        rows = view.get("rows");
        // if we have more data than we do rows then we can't prune
        // anything, or even if they are the same
        if (len >= rows.length) return;
        // otherwise we have to prune off the unnecessary rows we now have
        rows = rows.slice(len);
        enyo.forEach(rows, function (row) {row.destroy()});
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