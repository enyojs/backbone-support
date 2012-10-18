
(function () {

  var bindingOptions = {
    _autoBindings: null,
    destroy: function () {
      var c = this.get("controller");
      if (c) c.destroy();
      this.controller = null;
      this._clearAutoBindings();
      //this.inherited(arguments);
      
      // TODO: THIS IS SO DUMB!!!!
      this.__proto__.destroy.call(this);
    },
    
    
    _initAutoBindings: function () {
      var c = this.get("controller"), ctr, bindProp, ch;
      if (!c) return;
      for (ch in this.$) {
        if (!this.$.hasOwnProperty(ch)) continue;
        ctr = this.$[ch];
        bindProp = ctr.bindProperty;
        if (!bindProp) continue;
        this._autoBinding({
          from: "." + bindProp,
          to: this.getBindTargetFor(ctr),
          source: c,
          target: ctr
        });
      }
    },
    syncBindings: function () {
      var a = this._autoBindings, i = 0, b;
      for (; i < a.length; ++i) {
        b = a[i];
        if (b) b.sync(true);
      }
    },
    getBindTargetFor: function (inControl) {
      var r = inControl.get("bindTarget");
      if (!r) r = ".content";
      return r[0] === "."? r: "." + r;
    },
    _controllerChanged: enyo.Observer(function () {
      this._clearAutoBindings();
      this._initAutoBindings();
    }, "controller"),
    _autoBinding: function () {
      var a = this._autoBindings || (this._autoBindings = []),
          b, args, props = {}, i = 0;
      args = enyo.toArray(arguments);
      for (; i < args.length; ++i) enyo.mixin(props, args[i]);
      b = new enyo.Binding({owner: this, autoConnect: true}, props);
      b.isAutoBinding = true;
      a.push(b);
      return b;
    },
    _clearAutoBindings: function () {
      var a = this._autoBindings, b;
      if (!a) return;
      while (a.length > 0) {
        b = a.shift();
        b.destroy();
      }
    }
  };

  enyo.kind({
    name: "enyo.CollectionRepeater",
    published: {
      controller: null,
      length: null,
      content: null,
      bindProperty: "content"
    },
    create: function () {
      this.inherited(arguments);
      this.controllerChanged();
      this.contentChanged();
    },
    controllerChanged: function () {
      var cs = this.get("controller"), c, b = this.get("bindProperty"), str, h, e;
      if (enyo.isString(cs)) c = this.controller = enyo._getPath(cs);
      else c = cs;
      if (!c) {
        console.warn("enyo.CollectionRepeater.controllerChanged: none found or available", cs);
        return false; // can't do anything
      }
      if (enyo.isFunction(c)) c = this.controller = new c;
      this.clearBindings();
      str = "controller." + (b[0] === "."? b.slice(1): b);
      this.binding({
        from: str,
        to: "content"
      });
    },
    initComponents: function () {
      this.rowControl = this.components || this.kindComponents;
      this.components = this.kindComponents = null;
      this.rowControl = this.rowControl[0];
      this.inherited(arguments);
    },
    render: function () {
      var i = 0, c, ch, m = this.get("content"), len = this.length, getController, refresh = false;
        
      getController = function (controller, model) {
        if (c) return c instanceof enyo.Controller? c.set("model", model): new c({model: model});
        if (controller && enyo.isString(controller)) c = enyo._getPath(controller);
        else if (controller && controller instanceof enyo.Controller) c = controller;
        else if (controller && enyo.isFunction(controller)) c = controller;
        if (!c) c = enyo.ModelController;
        return getController(c, model);
      };
      
      for (i = 0; i < len; ++i) {
        if ((ch = this.children[i])) {
          ch.controller.set("model", m[i]);
          //ch.controller.set("owner", ch);
          ch.syncBindings();
          refresh = false;
        } else {
          refresh = true;
          ch = this.createComponent(this.rowControl, bindingOptions);
          ch.set("controller", getController(ch.controller || ch.controllerClass, m[i]));
        }
        // NOTE: because of Control's overload of _setup
        ch._setup(true);
        if (refresh) ch.render();
      }
      
      if (i < this.children.length) {
        ch = this.children.slice(len);
        while (ch.length) {
          c = ch.shift();
          c.destroy();
        }
      }
    },
    
    contentChanged: function () {
      var c = this.get("content");
      
      if (!c) return;
      
      // as opposed to before, manually set the length property
      // locally once we know the content has been updated
      if (this.length !== c.length) this.set("length", c.length);
      this.render();
    }
  });

}());