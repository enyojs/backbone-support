(function () {
    
    var remapped = {
        bindFrom: "from",
        bindTo: "to",
        bindTransform: "transform",
        bindOneWay: "onWay",
        bindAutoSync: "autoSync"
    };
    
    var defaults = {
        to: ".content",
        transform: null,
        oneWay: true,
        autoSync: false
    };
    
    enyo.Mixin({
        //*@public
        name: "enyo.AutoBindingSupport",
        //*@protected
        didSetupAutoBindings: false,
        //*@protected
        initMixin: function () {
            this.autoCache = {};
            this.setupAutoBindings();
        },
        //*@protected
        autoBinding: function () {
            var bind = this.binding.apply(this, arguments);
            bind.autoBindingId = enyo.uid("autoBinding");
        },
        //*@protected
        autoBindings: enyo.Computed(function () {
            return enyo.filter(this.bindings || [], function (bind) {
                return bind && bind.autoBindingId;
            });
        }),
        //*@protected
        setupAutoBindings: function () {
            if (this.didSetupAutoBindings) return;
            if (!this.controller) return;
            var controls = this.get("bindableControls");
            var idx = 0;
            var len = controls.length;
            var controller = this.controller;
            var control;
            var props;
            for (; idx < len; ++idx) {
                control = controls[idx];
                props = this.bindProperties(control);
                this.autoBinding(props, {source: controller, target: control});
            }
            this.didSetupAutoBindings = true;
        },
        //*@protected
        bindProperties: function (control) {
            return enyo.mixin(enyo.remap(remapped, control), defaults);
        },
        //*@protected
        bindableControls: enyo.Computed(function (control) {
            var cache = this.autoCache["bindableControls"];
            if (cache) return enyo.clone(cache);
            var bindable = [];
            var control = control || this;
            var controls = control.controls || [];
            var idx = 0;
            var len = controls.length;
            for (; idx < len; ++idx) {
                bindable = bindable.concat(this.bindableControls(controls[idx]));
            }
            if ("bindFrom" in control) bindable.push(control);
            if (this === control) this.autoCache["bindableControls"] = enyo.clone(bindable);
            return bindable;
        }),
        //*@protected
        controllerDidChange: enyo.Observer(function () {
            this.inherited(arguments);
            if (this.controller) {
                if (!this.didSetupAutoBindings) {
                    this.setupAutoBindings();
                }
            }
        }, "controller")
    });
    
}());
