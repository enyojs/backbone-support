(function () {
  
  //*@public
  /**
    _MVC_ provides a pattern such that there is a singleton instance of
    an _application_ and that this _application_ does not actually execute
    until the _start_ method is fired. Methods can be registered in the
    startup queue via the _enyo.run_ method. Calling _enyo.start_ will
    ensure that this queue is flushed at the appropriate time and that the
    registered application will begin its execution.
  */
  enyo.start = function () {
    // TODO: this needs to be revisited but is a placeholder for now
    if (enyo._app) {
      enyo._app.start();
      enyo.isStarted = true;
      enyo.flushStartupQueue();
    } else enyo.warn("No application found");
  };
  
  //*@protected
  // @TODO: REVISIT
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
  
  //*@protected
  enyo._queue = [];
  
  //*@public
  /**
    Execute the method (with the optional context) when the framework
    has received the _enyo.start_ command. If the framework has already
    started, the method will be exected immediately, otherwise it will
    be added to a queue and flushed at the appropriate time.
  */
  enyo.run = function (fn, context) {
    var q = enyo._queue || [], args = enyo.toArray(arguments).slice(2);
    if (!fn) return false;
    if (enyo.isString(fn)) {
      fn = enyo.getPath.call(context, fn);
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
  
  //*@protected
  enyo.flushStartupQueue = function () {
    var q = enyo._queue, fn;
    if (!q) return true;
    while (q && q.length) {
      fn = q.shift();
      if (fn && enyo.isFunction(fn)) fn();
    }
  };
  
  //*@protected
  // preserve the original constructors
  enyo.Backbone = enyo.Backbone? enyo.Backbone: {};
  enyo.Backbone.Model = Backbone.Model;
  enyo.Backbone.Collection = Backbone.Collection;
  // replace the constructors Backbone will be using
  // with our enyo.Extensions
  Backbone.Model = enyo.Model;
  Backbone.Collection = enyo.Collection;
  
}());
