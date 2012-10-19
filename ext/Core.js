(function () {
  
  enyo.start = function () {
    // TODO: this needs to be revisited but is a placeholder for now
    if (enyo._app) {
      enyo._app.start();
      enyo.isStarted = true;
      enyo.flushStartupQueue();
    } else console.warn("No application found");
  };
  
  // there is a concept for the ApplicationController, perhaps another
  // type of controller altogether, that it has a "handle"
  // capability that will accept an "event" or "trigger" and
  // asynchronously execute the handler (if it has one) if
  // the property matches the trigger/event as a general
  // form of delegation
  enyo._handle = function (trigger) {
    if (trigger in this) {
      enyo.asyncMethod(this, function (args) {
        if (this.beforeHandler) this.beforeHandler(trigger);
        this[trigger].apply(this, args);
      }, arguments);
      return true;
    } else return false;
  };
  
  enyo._queue = [];
  
  enyo.run = function (fn, context) {
    var q = enyo._queue || [], args = enyo.toArray(arguments).slice(2);
    if (!fn) return false;
    if (enyo.isString(fn)) {
      fn = enyo._getPath.call(context, fn);
      if (!fn) return false;
    }
    if (!enyo.isFunction(fn)) return false;
    if (enyo.isStarted) {
      return fn.apply(context, args);
    } else {
      q.push(enyo.bind(context, function (fn, args) {
        fn.apply(this, args);
      }, fn, args));
    }
  };
  
  enyo.flushStartupQueue = function () {
    var q = enyo._queue, fn;
    if (!q) return true;
    while (q && q.length) {
      fn = q.shift();
      if (fn && enyo.isFunction(fn)) fn();
    }
  };
  
  // TODO: WTF!??!
  enyo.Backbone = enyo.Backbone? enyo.Backbone: {};
  enyo.Backbone.Model = Backbone.Model;
  enyo.Backbone.Collection = Backbone.Collection;
  // now attempt to map models to...
  Backbone.Model = enyo.Model;
  Backbone.Collection = enyo.Collection;
  
}());