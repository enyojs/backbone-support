
//*@public
/**
    _enyo.CollectionRepeater_ and _enyo.CollectionList_ both share a
    few common functions that we apply via a _enyo.Mixin_ here.
*/
enyo.Mixin({
    name: "enyo.CommonCollectionViewMixin",
    //*@protected
    /**
        The computed property that will accurately return the components
        as were defined either in an inlined collection list or a
        subclass with children bearing isChrome: true.
    */
    items: enyo.Computed(function () {
        return this.components && this.components.length?
            this.components: this.kindComponents;
    }),
    //*@protected
    /**
        Determines and returns the correct string representation
        of the required collection from the base kind.
    */
    controllerKind: enyo.Computed(function () {
        var base = this.base;
        var ctor = this.ctor;
        var prototype = base.prototype;
        var controller = prototype.controller;
        if (!controller) {
            prototype = ctor.prototype;
            controller = prototype.controller;
        }
        return enyo.getPath(controller);
    }),
    /** 
        Overloaded controllerChanged to handle the various
        scenarios that can arise from the various ways this
        particular _kind_ can be created.
    */
    controllerChanged: function () {
        this.findAndInstance("controller", function (ctor, inst) {
            var other;
            var defaultKind = this.get("controllerKind");
            var kindName = this.kindName;
            var controllerName = this.controllerName;
            // if we don't have an instance that means there was
            // an attempt to use a subclass that could not be found
            if (!(ctor || inst)) {
                return enyo.error(kindName + ": request for " +
                    controllerName + " but it could not be found");
            }
            // we allow other types of collection controllers to be
            // assigned here, but we do need to figure out what kind
            // we have
            if (!(inst instanceof defaultKind)) {
                // great but we need that kind so we'll go ahead
                // and create it
                other = inst;
                ctor = defaultKind;
                inst = this.controller = new ctor();
                inst.set("owner", this);
            } else {
                // ok it was so lets make sure its owner is set to us
                inst.set("owner", this);
            }
            if (other) {
                // we need to figure out if the other controller is either
                // a collection controller or collection, either one will
                // be useable
                if (other instanceof Backbone.Collection) {    
                    // ok we will assign our collection property to this
                    // instance and let the controller choose it as its
                    // option
                    inst.set("collection", other);
                } else if (other instanceof enyo.CollectionController) {
                    inst.binding({source: other, from: "collection", to: "collection"});
                } else {
                    // this is a problem because we don't know what we can
                    // do with this object that was handed to us
                    return enyo.error(kindName + ": unknown kind used " +
                        "as controller or collection type, must subclass " +
                        "Backbone.Collection or enyo.CollectionController");
                }
            }
        });
    } 
});