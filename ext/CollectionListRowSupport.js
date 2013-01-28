//*@public
/**
*/
enyo.Mixin({
    name: "enyo.CollectionListRowSupport",
    initMixin: function () {
        this.binding({from: ".controller.selected", to: ".selected"});
    },
    selectedChanged: function () {
        this.addRemoveClass("selected", this.selected);
    }
});
