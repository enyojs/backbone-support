
//*@public
/**
    The _enyo.CollectionRepeaterController_ kind is a special
    _enyo.CollectionController_ designed to work with the
    _enyo.CollectionRepeater_ view kind. You can explicitly
    subclass this kind or set the _controller_ property on an
    _enyo.CollectionRepeater_ view to a normal _enyo.CollectionController_
    instance and it will automatically proxy the content via this
    kind.
*/
enyo.kind({
    name: "enyo.CollectionRepeaterController",
    kind: "enyo.CollectionController",
    // handlers
    handlers: {
      onpreparerow: "prepareRow",
      // collection events
      oncollectionadd: "modelAdded"
    },
    render: function (idx) {
        // if we do not have an owner we can't do anything
        if (!this.owner) return false;
        // we need to scope the views we create according to the
        // settings of our owner
        var view = this.owner;
        // we need to have our data
        var data = this.get("data") || [];
        // our known length
        var len = data.length;
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
    },
    collectionChanged: function () {
        this.inherited(arguments);
        this.renderAllRows();
    },
    renderAllRows: function () {
        var data = this.get("data") || [];
        var len = data.length;
        var idx = 0;
        for (; idx < len; ++idx) this.render(idx);
        this.prune();
    },
    modelAdded: function (sender, event) {
        var model = event.model;
        var idx = this.indexOf(model);
        if (model && !isNaN(idx) && -1 !== idx) this.render(idx);
    },
    prune: function () {
        // we need to be able to compare the length of our known dataset
        // against the length of the number of rendered rows we have
        var len = (this.get("data") || []).length;
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