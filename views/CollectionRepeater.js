
//*@public
/**
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.CollectionRepeater",
    
    //*@public
    kind: "wip.Repeater",
    
    //*@public
    collection: null,
    
    //*@public
    model: null,
    
    //*@public
    mixins: ["enyo.CommonCollectionViewMixin"],

    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    defaultChildController: "enyo.ModelController",

    // ...........................
    // COMPUTED PROPERTIES
    
    // ...........................
    // PUBLIC METHODS
    
    // ...........................
    // PROTECTED METHODS
    
    
    //*@protected
    didChange: function (sender, event) {
        this.log(event);
        var values = event.values;
        var indices = enyo.keys(values);
        var idx;
        var len = indices.length;
        var children = this.children;
        var child;
        var pos = 0;
        for (; pos < len; ++pos) {
            idx = indices[pos];
            child = children[idx];
            if (!child) continue;
            child.controller.set("data", values[idx]);
        }
    }
    // ...........................
    // OBSERVERS
    
});
