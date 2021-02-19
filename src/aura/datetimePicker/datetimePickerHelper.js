({
    computeClassNames: function(component) {
        var value = ['slds-form slds-form--compound'];

        var classAttr = component.get('v.class');
        if (classAttr) {
            value.push(classAttr);
        }

        component.set('v.privateComputedClass', value.join(' '));
    },

    handleValueChange: function(component, event) {
        var date = component.find("date").get("v.value");
        var time = component.find("time").get("v.value");

        time = _.round(time / (60 * 1000));
        var hours = _.floor(time / 60);
        var minutes = time - hours * 60;
        var datetime = moment(date).hours(hours).minutes(minutes).toDate().getTime();
        component.set("v.value", datetime);

        this.fireEvent(component, "onchange");
    },

    handleDateTimeValueChange: function(component, event) {
        var datetime = component.get("v.value");
        if(datetime) {
            var m = moment(datetime);
            component.find("date").set("v.value", datetime);
            component.find("time").set("v.value", (m.hours() * 60 + m.minutes()) * 60 * 1000);
        }
        else {
            component.find("date").set("v.value", null);
            component.find("time").set("v.value", null);
        }
    },

    handleNodeBlur: function(component, event) {
        this.fireEvent(component, "onblur");
    },

    handleNodeFocus: function(component, event) {
        this.fireEvent(component, "onfocus");
    },
})
