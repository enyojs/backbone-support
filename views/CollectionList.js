
//*@public
/**
    This is an interim-kind. It is designed to be functional - integrating
    an API similar to _enyo.List_ and work with _enyo.CollectionController_s
    using _Backbone.Collection_s and _Backbone.Model_s. __It will not exist
    in the future.__ A kind with a similar API will replace it.
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.CollectionList",
    
    //*@public
    kind: "enyo.List",
    
    //*@public
    multiselect: false,
    
    //*@public
    collection: null,
    
    //*@public
    model: null,
    
    //*@public
    defaultChildController: "enyo.ModelController",
    
    //*@public
    childMixins: ["enyo.AutoBindingSupport", "enyo.CollectionListRowSupport"],
    
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    concat: "childMixins",
    
    //*@protected
    handlers: {
        // collection controller events
        didadd: "repeaterDidAdd",
        didremove: "repeaterDidRemove",
        didreset: "repeaterDidReset",
        didchange: "repeaterDidChange",
        // other
        onSetupItem: "setupItem"
    },

    //*@protected
    bindings: [
        {from: ".controller.length", to: ".length"},
        {from: ".length", to: ".count"},
        {from: ".controller.data", to: ".data"}
    ],
    
    // ...........................
    // PROTECTED METHODS
    
    //*@protected
    initComponents: function () {
        var components = this.kindComponents || this.components || [];
        var def = (function (children) {
            return children.length > 1? {components: children}: children[0];
        }(components));
        var mixins = def.mixins || [];
        var ctor;
        this.findAndInstance("defaultChildController");
        def.controller = this.childController;
        def.mixins = enyo.merge(mixins, this.childMixins);
        this.components = [def];
        this.kindComponents = [];
        this.inherited(arguments);
    },
    
    //*@protected
    defaultChildControllerFindAndInstance: function (ctor, inst) {
        this.childController = inst;
    },
    
    //*@protected
    decorateEvent: function (name, event, sender) {
        var model;
        this.inherited(arguments);
        if (!isNaN(event.index) && this.controller) {
            model = this.controller.at(event.index);
            if (model) event.model = model;
            else event.model = null;
        }
    },
    
    //*@protected
    setupItem: function (sender, event) {
        var model = event.model;
        if (true === event.selected) {
            if (model) {
                this.controller.select(model);
            }
        }
        if (model) this.childController.set("model", model);
    },

    //*@protected
    lengthChanged: function (prev, len) {
        if (len) {
            if (0 === prev) {
                this.reset();
            } this.refresh();
        }
    },
    
    //*@protected
    repeaterDidChange: function (sender, event) {
        var values = event.values;
        var indices = enyo.keys(values);
        var idx;
        var len = indices.length;
        var pos = 0;
        for (; pos < len; ++pos) {
            idx = indices[pos];
            this.renderRow(parseInt(idx));
        }
    },
    
    //*@protected
    repeaterDidReset: function (sender, event) {
        this.reset();
    }
    
});
