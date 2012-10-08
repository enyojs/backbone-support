// just an attempt to skate by...
enyo.kind({
  name: "enyo.Model",
  kind: "enyo.Extension",
  extendFrom: "Backbone.Model",
  target: "_model",
  _model: null,
  published: {
    model: "",
    modelProperties: null,
    saveOnChange: true
  },
  constructor: function () {
    this.inherited(arguments);
    var p = this._get("modelProperties") || {};
    this.model = this._base.extend(p);
  },
  methods: [
    "escape",
    "has",
    "unset",
    "clear",
    "defaults",
    "toJSON",
    "save",
    "destroy",
    "validate",
    "isValid",
    "url",
    "urlRoot",
    "parse",
    "clone",
    "isNew",
    "change",
    "hasChanged",
    "changedAttributes",
    "previous",
    "previousAttributes"
  ]
});