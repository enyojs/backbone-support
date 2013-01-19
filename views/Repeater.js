enyo.kind({
    name: "mvc.Repeater",
    kind: "enyo.View",
    //*@public
    defaultRowController: "enyo.ObjectController",
    //*@public
    childMixins: ["enyo.AutoBindingSupport"],
    //*@protected
    concat: "childMixins",
    //*@protected
    handlers: {
        didadd: "didAdd",
        didremove: "didRemove",
        didreset: "didReset",
        didchange: "didChange",
        didmove: "didMove",
        didswap: "didSwap"
    },
    //*@public
    /**
        A computed property that represents the length of the
        current _data_ value as data may be overloaded and only
        be a subset (e.g. filtered) of the total data. This will
        the equivalent of the number of children that are rendered.
    */
    length: enyo.Computed(function () {
        return (this.get("data") || []).length;
    }, "data"),
    //*@public
    /**
        A computed property that can be overloaded for special
        behaviors (e.g. filtered dataset).
    */
    data: enyo.Computed(function () {
        return this.get("controller.data") || [];
    }),
    //*@protected
    /**
        Initializes the children array.
    */
    constructor: function () {
        this.children = this.children || [];
        return this.inherited(arguments);
    },
    create: function () {
        this.inherited(arguments);
        this.sync();
    },
    //*@protected
    initComponents: function () {
        // we intercept the original components definition to hyjack
        // the normal flow of initializing components
        var components = this.kindComponents || this.components || [];
        // we try and retrieve the definition/configuration for the child
        // component/view we will need to use in the repeater
        var def = components[0];
        // we grab a reference to any mixins the definition might have
        // so we can add the one we know needs to be there
        var mixins = def.mixins || [];
        // now we add the auto-bindings support mixin so it will always
        // be applied to our children
        def.mixins = enyo.merge(mixins, this.childMixins);
        // if the definition for the child does not have a controller set
        // we apply our default
        if (!def.controller) def.controller = this.defaultRowController;
        // we reset whichever of these was going to be used (or both)
        // so we don't actually create any children/controls at this time
        this.kindComponents = this.components = null;
        // finish our own normal initialization without component creation
        this.inherited(arguments);
        // if the child definition itself has a name it won't work because
        // we'll be repeating it so we remove it
        // note that names on the children will be fine because they will
        // become kindComponents of the child when it is implemented
        delete def.name;
        // this is where the components on the child definition become
        // kind components (if they weren't already)
        this.child = enyo.kind(def);
    },
    //*@protected
    /**
        Whenever a new value is added to the dataset we receive this
        event. Because it is an addition we know we'll be adding a
        child or some children (depending on how many elements were added).
        This allows us find and render only the new elements and when
        necessary rerender any changed indeces only.
    */
    didAdd: function (sender, event) {
        var multi = event.multiple;
        var value = event.value;
        var idx = event.index;
        if (multi) {
            for (idx in value) {
                this.update(idx);
            }
        } else this.update(idx);
    },
    //*@protected
    didRemove: function (sender, event) {
        var multi = event.multiple;
        var value = event.value;
        var idx = event.index;
        if (multi) {
            idx = enyo.keys(value).shift();
        }
        this.sync(idx);
        this.log("done");
        this.prune();
    },
    
    
    prune: function () {
        var children = this.children;
        var len = this.get("length");
        var idx = 0;
        var blackbook = children.slice(len);
        var count = blackbook.length;
        for (; idx < count; ++idx) blackbook[idx].destroy();
    },
    
    //*@protected
    sync: function (start, end) {
        var idx = start || 0;
        var fin = end || this.get("length")-1;
        var data = this.get("data");
        for (; idx <= fin; ++idx) this.update(idx, data);
    },
    //*@protected
    update: function (index, data) {
        var children = this.children;
        var data = data? data.length? data[index]: data: this.get("data")[index];
        var child = children[index];
        var len = this.get("length");
        if (index < 0 || index >= len) return;
        if (!data && child) {
            this.remove(index);
        } else if (data && !child) {
            this.add(index, data);
        } else if (data && child) {
            child.controller.set("data", data);
        }
    },
    //*@protected
    remove: function (index) {
        this.log(index);
    },
    //*@protected
    add: function (index, data) {
        var children = this.children;
        var pos = children.length;
        var data = data || this.get("data")[index];
        var kind = this.child;
        var child;
        if (pos !== index) {
            throw "add was called for index other than the end";
        }
        child = this.createComponent({kind: kind});
        child.controller.set("data", data);
        child.render();
    },
    //*@protected
    didChange: function (sender, event) {
        var idx = event.index;
        var prop = event.path;
        var child = this.children[idx];
        var prev = event.previous;
        var cur = event.current;
        child.controller.notifyObservers(prop, prev, cur);
    },
    //*@protected
    didMove: function (sender, event) {
        var from = event.from > event.to? event.to: event.from;
        var to = from === event.to? event.from: event.to;
        this.sync(from, to);
    },
    //*@protected
    didSwap: function (sender, event) {
        var from = event.from;
        var to = event.to;
        this.update(from);
        this.update(to);
    }
});
