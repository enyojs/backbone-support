
//*@public
/**
    The _enyo.CollectionRepeater_ is much like _enyo.CollectionList_
    except it does not use a flyweight pattern. Each row is an active
    control and as such care should be taken when deciding to use this
    kind. It is great for medium sized lists that require significant
    interaction inline such as input fields.
*/
enyo.kind({
    name: "enyo.CollectionRepeater",
    controller: "enyo.CollectionRepeaterController",
    collection: null,
    model: null,
    controlParentName: "client",
    // support for multiselection
    multiselect: false,
    includeScroller: true,
    tools: [
        {name: "client", kind: "enyo.Scroller", isChrome: true}
    ],
    mixins: ["enyo.CommonCollectionViewMixin"],
    /**
        We need to initialize our components in the normal way
        with some slightly added behavior. We have to make sure
        we can find the original components that our controller
        will need regardless of whether we were subclassed or
        inlined in an components block.
    */
    initComponents: function () {
        // use our computed property to get the correct original
        // pre-instanced components
        var items = this.get("items");
        // reused variable for mixins in each item
        var mixins;
        // make sure that they know to use the correct mixin type
        enyo.forEach(items, function (item) {
            // if there are other mixins we preserve them
            // usually not the case but just making sure
            mixins = item.mixins || [];
            mixins.push("enyo.CollectionRowMixin");
            item.mixins = mixins;
        });
        // our real strategy here is to use a scroller
        if (this.includeScroller) {
            this.createComponents(this.tools);
        }
    },
    /**
        A computed property that returns only the views/controls that are
        children of the scroller so it is excluded from the list of views
        handed to the controller. Note that using a computed propertyu actually
        gives additional freedom for components NOT a part of the scroller or the
        list body!
    */
    rows: enyo.Computed(function () {
        if (this.includeScroller) {
            return enyo.filter(this.controls, function (control) {
                return control.parent && control.parent.name === "strategy";
            });
        } else {
            return this.controls;
        }
    }),
    /**
        Every time we create a new row we need to make sure it has a unique
        name since we're using the definition over and over again - and any
        name assigned will cause issues.
    */
    adjustComponentProps: function (props) {
        this.inherited(arguments);
        if (props.name) {
            // if it is our control parent (scroller) leave it alone
            if (props.name === "client") return;
            props.originalName = props.name;
            props.name = enyo.uid("_repeater");
        }
    },
    //*@protected
    /**
        This is a temporary workaround.
    */
    reflow: function () {
        if (this.includeScroller) {
            var bounds = this.getBounds();
            var height = bounds.height;
            var client = this.$.client;
            if (enyo.exists(client)) client.setBounds({height: height});
        }
        this.inherited(arguments);
    }
});
