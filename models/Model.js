(function () {
    
    // overload the getter for models to support nested
    // paths to relational data
    Backbone.Model.prototype.get = function (path) {
        var parts = path.split(".");
        var next;
        var ret;
        // fast path
        if (1 === parts.length) {
            return this.attributes[path];
        } else {
            next = this.get(parts.shift());
            path = parts.join(".");
            if (next instanceof Backbone.Model) {
                ret = next.get(path);
            } else if (next instanceof Backbone.Collection) {
                ret = next[path];
            }
            return ret;
        }
    };
    
}());