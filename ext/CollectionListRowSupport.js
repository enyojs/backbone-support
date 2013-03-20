//*@public
/**
*/
enyo.createMixin({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.CollectionListRowSupport",
    
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    _supports_collection_list_row: true,
    
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
    _selected_changed: enyo.observer(function () {
        this.addRemoveClass("selected", this.selected);
    }, "selected")

});
