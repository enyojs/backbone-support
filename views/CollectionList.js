
//*@public
/**
	This is an interim kind. It is designed to be functional, integrating
	an API similar to that of _enyo.List_ and working with instances of
	_enyo.CollectionController_ that use _Backbone.Collection_ and
	_Backbone.Model_ objects. This kind will not exist in the future; a
	kind with a similar API will replace it. Currently, this kind does not
	support multiselect _completely_.
*/
enyo.kind({
	
	// ...........................
	// PUBLIC PROPERTIES
	
	//*@public
	name: "enyo.CollectionList",
	
	//*@public
	kind: "enyo.List",
	
	//*@public
	multiselect: false,
	
	//*@public
	collection: null,
	
	//*@public
	model: null,
	
	//*@public
	defaultChildController: "enyo.ModelController",
	
	//*@public
	childMixins: [
		"enyo.AutoBindingSupport",
		"enyo.CollectionListRowSupport"
	],
	
	// ...........................
	// PROTECTED PROPERTIES
	
	//*@protected
	concat: "childMixins",
	
	//*@protected
	handlers: {
		// collection controller events
		didadd: "repeaterDidAdd",
		didremove: "repeaterDidRemove",
		didreset: "repeaterDidReset",
		didchange: "repeaterDidChange",
		// other
		onSetupItem: "setupItem"
	},

	//*@protected
	bindings: [
		{from: ".controller.length", to: ".length"},
		{from: ".length", to: ".count"},
		{from: ".controller.selection", to: ".selection"},
		{from: ".controller.data", to: ".data"}
	],
	
	// ...........................
	// PROTECTED METHODS
	
	//*@protected
	initComponents: function () {
		var components = this.kindComponents || this.components || [];
		var def = (function (children) {
			return children.length > 1? {components: children}: enyo.clone(children[0]);
		}(components));
		var mixins = def.mixins || [];
		var ctor;
		var name;
		this.findAndInstance("defaultChildController");
		def.controller = this.childController;
		def.mixins = enyo.merge(mixins, this.childMixins);
		name = def.name || enyo.uid("_list_component_");
		delete def.name;
		ctor = enyo.kind(def);
		def = {name: name, kind: ctor};
		this.components = [def];
		this.kindComponents = [];
		this.inherited(arguments);
	},
	
	//*@protected
	defaultChildControllerFindAndInstance: function (ctor, inst) {
		this.childController = inst;
	},
	
	//*@protected
	decorateEvent: function (name, event, sender) {
		var model;
		this.inherited(arguments);
		if (!isNaN(event.index) && this.controller) {
			model = this.controller.at(event.index);
			if (model) event.model = model;
			else event.model = null;
		}
	},
	
	//*@protected
	setupItem: function (sender, event) {
		var model = event.model;
		if (true === event.selected && model) {
			this.controller.select(model);
		} else if (!event.selected && model) {
			model.set("selected", false);
		}
		if (model) this.childController.set("model", model);
	},

	//*@protected
	lengthChanged: function (prev, len) {
		if (len) {
			if (0 === prev) {
				this.reset();
			} this.refresh();
		}
	},
	
	//*@protected
	repeaterDidChange: function (sender, event) {
		var values = event.values;
		var indices = enyo.keys(values);
		var idx;
		var len = indices.length;
		var pos = 0;
		for (; pos < len; ++pos) {
			idx = indices[pos];
			this.renderRow(parseInt(idx));
		}
	},
	
	//*@protected
	repeaterDidReset: function (sender, event) {
		this.reset();
	},
	
	//*@protected
	repeaterDidRemove: function (sender, event) {
		// Again, since the selection and rendering states are not
		// controlled by the data, we have to find a way to keep them
		// in sync. It is possible that, if a row was selected but the
		// model had its _destroy_ method executed, the list will still
		// think the row is selected and automatically cause the model
		// that is moved into that index to be selected; we detect that
		//here and deselect the row.
		var values = event.values;
		var indices = enyo.keys(values);
		var idx;
		var pos = 0;
		var len = indices.length;
		var data = this.get("data");
		var model;
		for (; pos < len; ++pos) {
			idx = indices[pos];
			model = values[idx];
			if (model) {
				if (model.changed) {
					if (false === model.changed.selected) {
						this.deselect(idx);
					}
				}
			}
		}
	},
	
	//*@protected
	selectionChanged: function () {
		if (this.selection) {
			var idx = this.controller.indexOf(this.selection);
			if (!this.getSelection().isSelected(idx)) {
				this.select(idx);
			}
		} else {
			var selection = this.getSelection();
			for (var key in selection.selected) {
				if (true === selection.selected[key]) {
					selection.clear();
					break;
				}
			}
		}
	}
	
});
