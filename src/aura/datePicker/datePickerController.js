({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "domLibrary");
        window.$System.addLibrary(helper, "validityLibrary");
        window.$System.addLibrary(helper, "interactingStateLibrary");

        var label = component.get('v.label');
        if (!label || label.length === 0) {
            $A.warning('Invalid `label` attribute for <c:datePicker> component.' + 'The `label` attribute is required, E.g.: <c:datePicker label="Resume" value="" />');
        }
        helper.initializeInteractingState(component);
        helper.computeClassNames(component);
        helper.appendToChild(component);

        var currentDate = null;
        var dateStr = component.get("v.date");
        var date = component.get("v.value");
        if(date) {
            currentDate = new Date(date);
            dateStr = helper.formatDate(currentDate);
            component.set("v.date", dateStr);
        }
        else if(dateStr) {
            currentDate = helper.parseInputDate(component, dateStr);
            date = helper.parseInputDate(component, dateStr).getTime();
            component.set("v.value", date);
        }
        if(!currentDate) {
            component.set("v.date", "");
        }

        helper.setDateValues(component, currentDate, currentDate && currentDate.getDate());

        helper.updateNamesOfWeekdays(component);
        helper.generateYearOptions(component, currentDate);

        helper.renderGrid(component);
    },

    doDestroy: function(component, event, helper) {
        helper.doDestroy(component);
    },

    handleDateValueChange: function(component, event, helper) {
        var date = component.get("v.value");
        if(date) {
            var currentDate = new Date(date);

            helper.setDateValues(component, currentDate, currentDate.getDate());
        }
    },

    handleClassChange: function(component, event, helper) {
        helper.computeClassNames(component);
    },

    focus: function(component, event, helper) {
        helper.setFocusOnDOMNode();
    },

    showHelpMessageIfInvalid: function(component, event, helper) {
        helper.showHelpMessageIfInvalid(component);
    },

    handleInputFocus: function(component, event, helper) {
        helper.showDatePicker(component);
    },

    handleYearChange: function(component, event, helper) {
        var data = event.getParam("data");
        var date = component.get("v.privateDate");
        var newYear = data.cmp.get("v.value");
        helper.changeYear(component, newYear, date);
    },

    handleClick: function(component, event, helper) {
        helper.selectDate(component, event);

        helper.hideDatePicker(component);
    },

    goToToday: function(component, event, helper) {
        event.stopPropagation();
        helper.goToToday(component, event);

        helper.hideDatePicker(component);
        return false;
    },

    goToPreviousMonth: function(component, event, helper) {
        event.stopPropagation();
        helper.changeMonth(component, -1);
        return false;
    },

    goToNextMonth: function(component, event, helper) {
        event.stopPropagation();
        helper.changeMonth(component, 1);
        return false;
    },

    toggleDatePicker: function(component, event, helper) {
        helper.toggleDatePicker(component);
    },
})
