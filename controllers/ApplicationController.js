enyo.kind({
  name: "enyo.ApplicationController",
  kind: "enyo.Controller",
  
  beforeHandler: enyo.nop,
  
  handle: function () {
    return enyo._handle.apply(this, arguments);
  }
});