(function () {

  //*@protected
  // preserve the original constructors
  enyo.Backbone = enyo.Backbone? enyo.Backbone: {};
  enyo.Backbone.Model = Backbone.Model;
  enyo.Backbone.Collection = Backbone.Collection;
  // replace the constructors Backbone will be using
  // with our enyo.Extensions
  Backbone.Model = enyo.Model;
  Backbone.Collection = enyo.Collection;
  //*@protected
  // map enyo.Control to synonymous enyo.View for clarity
  // between the closely associated but distinct enyo.Controller class
  enyo.View = enyo.Control;
  
}());
