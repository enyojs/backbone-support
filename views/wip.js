/**
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES

    //*@public
    name: "wip.List",
    
    //*@public
    kind: "wip.Repeater",
    
    //*@public
    row: "enyo.View",
    
    //*@public
    scroller: "enyo.Scroller",
    
    //*@public
    classes: "wip-list",
    
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    mixins: ["enyo.ListDimensions"],
    
    //*@protected
    components: [{
        name: "scroller"
    }],
    
    //*@protected
    controlParentName: "scroller",
    
    //*@protected
    _rows: null,
    
    //*@protected
    _views: [{
        name: "buffer1",
        kind: "enyo.ListBuffer"
    }, {
        name: "visible",
        kind: "enyo.ListVisible",
        components: [{
            name: "active",
            kind: "enyo.View"
        }]
    }, {
        name: "buffer2",
        kind: "enyo.ListBuffer"
    }],
    
    // ...........................
    // COMPUTED PROPERTIES
    
    //*@public
    rows: enyo.computed(function () {
        
    }),
    
    //*@protected
    _data_frame: enyo.computed(function () {
        // TESTING
        return {start: 0, end: 30};
    }),
    
    // ...........................
    // PUBLIC METHODS
    
    // ...........................
    // PROTECTED METHODS
    
    //*@protected
    constructor: function () {
        this._rows = new enyo.ArrayController();
        return this.inherited(arguments);
    },
    
    //*@protected
    initComponents: function () {
        this._init_scroller();
        this._init_views();
        this.inherited(arguments);
    },
    
    //*@protected
    _init_scroller: function () {
        var kind = enyo.getPath(this.scroller);
        var kinds = this.kindComponents;
        // reset the components so it won't be possible
        // to do the default
        this.kindComponents = null;
        kinds[0].kind = kind;
        // this will create the scroller and trigger the
        // discoverControlParent method
        this.createChrome(kinds);
    },
    
    //*@protected
    _init_views: function () {
        this.createChrome(this._views);
        // here we arbitrarily set the controlParent to 
        // the visible container
        this.controlParentName = "active";
        this.discoverControlParent();
    },
    
    //*@protected
    add: function (index, data) {
        var frame = this.get("_data_frame");
        if (index >= frame.start && index <= frame.end) {
            return this.inherited(arguments);
        }
    }
    
    // ...........................
    // OBSERVERS

});

enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.ListBuffer",
    
    //*@public
    classes: "wip-list-buffer",
    
    // ...........................
    // PROTECTED PROPERTIES
    
    // ...........................
    // COMPUTED PROPERTIES
    
    // ...........................
    // PUBLIC METHODS
    
    // ...........................
    // PROTECTED METHODS
    
    //*@protected
    reflow: function () {
        this.setBounds(this.get(".owner.dimensions."+this.name), "px");
    }
    
    // ...........................
    // OBSERVERS
    
});

enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.ListVisible",
    
    //*@public
    classes: "wip-list-visible",
    
    // ...........................
    // PROTECTED PROPERTIES
    
    // ...........................
    // COMPUTED PROPERTIES
    
    // ...........................
    // PUBLIC METHODS
    
    // ...........................
    // PROTECTED METHODS
    
    //*@protected
    reflow: function () {
        this.setBounds(this.get(".owner.dimensions.visible"), "px");
    }
    
    // ...........................
    // OBSERVERS

});
