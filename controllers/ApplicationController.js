enyo.kind({
  name: "enyo.ApplicationController",
  kind: "enyo.Controller",
  
  beforeHandler: enyo.nop,
  
  handle: function () {
    enyo._handle.apply(this, arguments);
  }
});