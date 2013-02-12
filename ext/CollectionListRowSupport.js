//*@public
/**
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.CollectionListRowSupport",
    
    //*@public
    kind: "enyo.Mixin",
    
    // ...........................
    // PROTECTED PROPERTIES
    
    // ...........................
    // COMPUTED PROPERTIES
    
    // ...........................
    // PUBLIC METHODS
    
    // ...........................
    // PROTECTED METHODS
    
    //*@protected
    create: function () {
        this.binding({from: ".controller.selected", to: ".selected"});
    },
    
    // ...........................
    // OBSERVERS
    
    //*@protected
    _selected_changed: enyo.Observer(function () {
        this.addRemoveClass("selected", this.selected);
    }, "selected")

});
