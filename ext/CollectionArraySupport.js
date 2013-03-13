//*@public
/**
*/
enyo.createMixin({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.CollectionArraySupport",
        
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    _supports_collection_array: true,
    
    // ...........................
    // COMPUTED PROPERTIES
    
    // ...........................
    // PUBLIC METHODS
    
    //*@public
    update: function (models, options) {
        return this.collection.update(models, options);
    },
    
    //*@public
    push: function (model, options) {
        return this.collection.push(model, options);
    },
    
    //*@public
    pop: function (options) {
        return this.collection.pop(options);
    },
    
    //*@public
    shift: function (options) {
        return this.collection.shift(options);
    },
    
    //*@public
    unshift: function (model, options) {
        return this.collection.unshift(model, options);
    },
    
    //*@public
    indexOf: function (value, sorted) {
        return this.collection.indexOf(value, sorted);
    },
    
    //*@public
    lastIndexOf: function (value, index) {
        return this.collection.lastIndexOf(value, index);
    },
    
    //*@public
    splice: function (index, many /* _values_ */) {
        var elements = enyo.toArray(arguments).slice(2);
        var elen = elements.length;
        var len = this.length;
        var max = len - 1;
        var ret = [];
        var changeset = {added: {len:0}, removed: {len:0}, changed: {len:0}};
        var pos = 0;
        var idx;
        var count;
        var range;
        var diff;
        var num;
        var models = this.collection.models;
        index = index < 0? 0: index >= len? len: index;
        many = many && !isNaN(many) && many + index <= len? many: 0;
        if (many) {
            range = index + many - elen;
            // special note here about the count variable, the minus one is because
            // the index in this operation is included in the many variable amount
            for (idx = index, count = index + many - 1 ; idx <= count; ++idx, ++pos) {
                ret[pos] = models[idx];
                if (elen && elen >= many) {
                    changeset.changed[idx] = models[idx];
                    changeset.changed.len++;
                } else if (elen && elen < many && idx < range) {
                    changeset.changed[idx] = models[idx];
                    changeset.changed.len++;
                }
                changeset.removed[idx] = models[idx];
                changeset.removed.len++;
            }
        }
        if (elen && elen > many) {
            diff = elen - many;
            pos = max;
            for (; pos >= index && pos < len; --pos) models[pos+diff] = models[pos];
            this.length += diff;
        } else {
            diff = many - (elen? elen: 0);
            pos = index + many;
            for (; pos < len; ++pos) {
                models[pos-diff] = models[pos];
                changeset.changed[pos-diff] = models[pos-diff];
                changeset.changed.len++;
            }
            idx = this.length -= diff;
            models.splice(idx, models.length - idx);
        }
        if (elen) {
            pos = 0;
            idx = index;
            diff = many? many > elen? many - elen: elen - many: 0;
            for (; pos < elen; ++idx, ++pos) {
                models[idx] = elements[pos];
                if (len && idx < len) {
                    changeset.changed[idx] = models[idx];
                    changeset.changed.len++;
                }
                if (!len || (diff && pos >= diff) || !many) {
                    changeset.added[len+pos-diff] = models[len+pos-diff];
                    changeset.added.len++;
                }
            }
        }
        this.collection.update(models, {add:false,remove:false,merge:false});
        if (changeset.removed.len) {
            delete changeset.removed.len;
            this.dispatchBubble("didremove", {values: changeset.removed}, this);
        }
        if (changeset.added.len) {
            delete changeset.added.len;
            this.dispatchBubble("didadd", {values: changeset.added}, this);
        }
        if (changeset.changed.len) {
            delete changeset.changed.len;
            this.dispatchBubble("didchange", {values: changeset.changed}, this);
        }
        return ret;
    },
    
    //*@public
    add: function (models, options) {
        this.collection.add(models, options);
    },
    
    //*@public
    remove: function (models, options) {
        this.collection.remove(models, options);
    },
    
    //*@public
    reset: function (models, options) {
        return this.collection.reset(models, options);
    },
    
    //*@public
    at: function (index) {
        return this.collection.at(index);
    },
    
    //*@public
    swap: function (index, to) {
        var models = this.collection.models;
        var from = models[index];
        var target = models[to];
        var changeset = {};
        changeset[index] = models[index] = target;
        changeset[to] = models[to] = from;
        this.collection.update(models, {add:false,remove:false,merge:false});
        this.dispatchBubble("didchange", {values: changeset}, this);
    },
    
    //*@public
    move: function (index, to) {
        var models = this.collection.models;
        var from = models[index];
        var changeset = {};
        var idx = index > to? to: index;
        var max = idx === index? to: index;
        var len = this.length; 
        models.splice(index, 1);
        models.splice(to, 0, from);
        this.collection.update(models, {add:false,remove:false,merge:false});
        for (; idx <= max; ++idx) changeset[idx] = models[idx];
        this.dispatchBubble("didchange", {values: changeset}, this);
    }
    
    // ...........................
    // PROTECTED METHODS
    
    // ...........................
    // OBSERVERS

});
