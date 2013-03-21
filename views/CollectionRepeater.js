
//*@public
/**
*/
enyo.kind({
	
	// ...........................
	// PUBLIC PROPERTIES
	
	//*@public
	name: "enyo.CollectionRepeater",
	
	//*@public
	kind: "wip.Repeater",
	
	//*@public
	collection: null,
	
	//*@public
	model: null,

	// ...........................
	// PROTECTED PROPERTIES
	
	//*@protected
	defaultChildController: "enyo.ModelController",
	
	//*@protected
	handlers: {
		collectionchanged: "repeaterDidReset"
	}
	
});
