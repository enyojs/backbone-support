enyo.kind({
    name: "wip.Repeater",
    
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
        didchange: "didChange"
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
        necessary rerender any changed indices only.
    */
    didAdd: function (sender, event) {
        this.log(event);
        var values = event.values;
        var indices = enyo.keys(values);
        var idx = 0;
        var len = indices.length;
        for (; idx < len; ++idx) this.update(indices[idx]);
    },
    
    //*@protected
    didRemove: function (sender, event) {
        this.log(event);
        var values = event.values;
        var indices = enyo.keys(values);
        var idx = 0;
        var len = indices.length;
        for (; idx < len; ++idx) this.sync(indices[idx]);
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
        this.log(start, end);
        var idx = start || 0;
        var fin = end || this.get("length")-1;
        var data = this.get("data");
        for (; idx <= fin; ++idx) this.update(idx, data);
    },
    
    //*@protected
    update: function (index, data) {
        this.log(index, data);
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
        this.log(index, data);
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
            child.controller.sync(values[idx]);
        }
    }
    
});
