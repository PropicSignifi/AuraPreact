({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var classnames = this.classnamesLibrary.classnames('slds-th__action slds-text-link_reset', classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    computeSortedClassNames: function(cmp) {
        var active = cmp.get('v.active');
        var variant = cmp.get('v.variant');
        var classnames = this.classnamesLibrary.classnames('slds-is-sortable', {
            'slds-is-sorted': active,
            'slds-grid': this.equal(variant, "control"),
        });
        cmp.set('v.privateComputedSortedClass', classnames);
    },

    onClick: function(cmp, event) {
        event.preventDefault();

        var name = cmp.get("v.name");
        var direction = cmp.get("v.direction");
        var active = cmp.get("v.active");

        if(direction === "asc") {
            direction = "desc";
        }
        else {
            direction = "asc";
        }

        if(!active) {
            active = true;
        }

        cmp.set("v.direction", direction);
        cmp.set("v.active", active);

        this.fireEvent(cmp, "onsort", {
            event: event,
            name: name,
            direction: direction,
        });
    },
})
