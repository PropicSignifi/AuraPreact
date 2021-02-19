({
    liveBindingAttrs: ["name", "value", "disabled", "readOnly", "required", "tabIndex", "accessKey", "placeholder"],

    FORMAT: "dd/MM/yyyy",

    appendToChild: function(cmp) {
        var helper = this;
        var elem = cmp.getElement();
        var popup = cmp.find("grid").getElement();
        popup.style.position = "absolute";
        document.body.appendChild(popup);
        cmp._popup = popup;
        this.adjustPopupPosition(cmp);

        cmp._adjustPopupPosition = $A.getCallback(function() {
            if(!cmp.get("v.privateExpanded")) {
                return;
            }
            helper.adjustPopupPosition(cmp);
        });

        window.addEventListener("resize", cmp._adjustPopupPosition, false);
        window.addEventListener("scroll", cmp._adjustPopupPosition, true);
    },

    adjustPopupPosition: function(cmp) {
        var elem = cmp.getElement();
        var popup = cmp._popup;
        var pos = window.$Utils.getPositionFromBody(elem);
        popup.style.left = pos.left + "px";
        popup.style.right = pos.right + "px";
        popup.style.top = pos.top + elem.getBoundingClientRect().height + "px";
    },

    doDestroy: function(cmp, event) {
        // Ommit removing child here because of lightning lazy handling of components
        window.removeEventListener("resize", cmp._adjustPopupPosition, false);
        window.removeEventListener("scroll", cmp._adjustPopupPosition, true);
    },

    computeClassNames: function(component) {
        var value = ['slds-form-element'];

        var classAttr = component.get('v.class');
        if (classAttr) {
            value.push(classAttr);
        }
        var required = component.get('v.required');
        if (required) {
            value.push('is-required');
        }
        if (!this.isInteracting(component) && !this.isInputValid(component)) {
            value.push('slds-has-error');
        }
        if (component.get('v.variant') === 'label-hidden') {
            value.push('slds-form--inline');
        }

        component.set('v.privateComputedClass', value.join(' '));
    },

    updateAriaDescribedBy: function(cmp) {
        var element = cmp.find('private').getElement();
        if (!element) {
            return;
        }

        if (cmp.get('v.privateHelpMessage')) {
            this.domLibrary.dom.updateAttr(element, 'aria-describedby', cmp.getGlobalId() + '-desc');
        } else {
            this.domLibrary.dom.removeAttr(element, 'aria-describedby');
        }
    },

    updateHelpMessage: function(component) {
        var validity = component.get('v.validity');
        var message = this.validityLibrary.validity.getMessage(component, validity);
        component.set('v.privateHelpMessage', message);
        this.updateAriaDescribedBy(component);
    },

    onAttrChangeFromOutside: function(component, domNode, domAttrName, event) {
        var value = component.get(event.getParam('expression'));

        if (domAttrName === 'value') {
            if (domNode.value !== value) {
                this.domLibrary.dom.updateAttr(domNode, domAttrName, value);
                component.set('v.validity', domNode.validity);
            }
        } else {
            this.domLibrary.dom.updateAttr(domNode, domAttrName, value);
        }
    },

    onNodeValueChange: function(component, domNode, event) {
        this.interacting(component);
        var value = domNode.value;
        var action;
        if (component.get("v.date") !== value) {
            component.set("v.validity", domNode.validity);
            component.set("v.date", value);
        }
    },

    handleNodeBlur: function(component, domNode, event) {
        this.leaveInteracting(component);
        this.handleManualDateChange(component);
        this.fireEvent(component, "onblur");
    },

    handleNodeFocus: function(component, domNode, event) {
        this.enterInteracting(component);
        this.fireEvent(component, "onfocus");
    },

    bindInput: function(component) {
        var dom = this.domLibrary.dom;
        var domNode = component.find('private').getElement();
        this.liveBindingAttrs.forEach(function(domAttrName) {
            var expression = 'v.' + (domAttrName === "value" ? "date" : domAttrName.toLowerCase());

            dom.updateAttr(domNode, domAttrName, component.get(expression));

            component.addValueHandler({
                event: 'change',
                value: expression,
                method: this.onAttrChangeFromOutside.bind(this, component, domNode, domAttrName)
            });
        }, this);
        dom.addChangeEvent(domNode, $A.getCallback(this.onNodeValueChange.bind(this, component, domNode)));
        dom.updateAttr(domNode, 'onFocus', $A.getCallback(this.handleNodeFocus.bind(this, component, domNode)));
        dom.updateAttr(domNode, 'onBlur', $A.getCallback(this.handleNodeBlur.bind(this, component, domNode)));
        component.set('v.validity', domNode.validity);
        return domNode;
    },

    unbindInput: function(component) {
        var dom = this.domLibrary.dom;
        var domNode = component.find('private').getElement();
        dom.releaseNode(domNode);
    },

    setFocusOnDOMNode: function(component) {
        var domNode = component.find('private').getElement();
        domNode.focus();
    },

    showHelpMessageIfInvalid: function(component) {
        this.showHelpMessage(component);
    },

    showHelpMessage: function(component) {
        this.computeClassNames(component);
        this.updateHelpMessage(component);
    },

    isInputValid: function(component) {
        return this.validityLibrary.validity.isValid(component.get('v.validity'));
    },

    isInteracting: function(component) {
        return component._interactingState.isInteracting();
    },

    initializeInteractingState: function(component) {
        var InteractingState = this.interactingStateLibrary.InteractingState;
        component._interactingState = new InteractingState({
            duration: 2000
        });
        component._interactingState.onleave($A.getCallback(function() {
            this.showHelpMessage(component);
        }
        .bind(this)));
    },

    interacting: function(component) {
        component._interactingState.interacting();
    },

    enterInteracting: function(component) {
        component._interactingState.enter();
    },

    leaveInteracting: function(component) {
        component._interactingState.leave();
    },

    isDateValid: function(date) {
        if (date && Object.prototype.toString.call(date) === "[object Date]") {
            if (isNaN(date.getTime())) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    },

    parseInputDate: function(component, datestr) {
        var parsedDate = $A.localizationService.parseDateTime(datestr, this.FORMAT);

        return parsedDate;
    },

    setDateValues: function(component, fullDate, dateNum) {
        fullDate = fullDate || new Date();
        dateNum = dateNum || fullDate.getDate();
        component.set("v.privateYear", fullDate.getFullYear());
        component.set("v.privateYearStr", "" + fullDate.getFullYear());
        component.set("v.privateMonth", fullDate.getMonth());
        component.set("v.privateMonthName", _.toUpper(this.l10n.months.longhand[fullDate.getMonth()]));
        component.set("v.privateDate", dateNum);
        component.set("v.value", fullDate.getTime());
    },

    updateNamesOfWeekdays: function(component) {
        var firstDayOfWeek = $A.get("$Locale.firstDayOfWeek") - 1; // The week days in Java is 1 - 7
        var namesOfWeekDays = $A.get("$Locale.nameOfWeekdays");
        _.each(namesOfWeekDays, function(name) {
            name.displayName = _.capitalize(name.shortName);
        });
        var days = [];
        if (this.isNumber(firstDayOfWeek) && $A.util.isArray(namesOfWeekDays)) {
            for (var i = firstDayOfWeek; i < namesOfWeekDays.length; i++) {
                days.push(namesOfWeekDays[i]);
            }
            for (var j = 0; j < firstDayOfWeek; j++) {
                days.push(namesOfWeekDays[j]);
            }
            component.set("v.privateNamesOfWeekdays", days);
        } else {
            component.set("v.privateNamesOfWeekdays", namesOfWeekDays);
        }
    },

    generateYearOptions: function(component, fullDate) {
        fullDate = fullDate || new Date();
        var years = [];
        var startYear = component.get("v.startYear") || fullDate.getFullYear() - 100;
        var endYear = component.get("v.endYear") || fullDate.getFullYear() + 50;
        var thisYear = fullDate.getFullYear();

        for (var i = startYear; i <= endYear; i++) {
            years.push({
                label: "" + i,
                value: "" + i,
            });
        }

        component.set("v.privateYearOptions", years);
    },

    renderGrid: function(component) {
        this.generateMonth(component);
    },

    formatDate: function(d) {
        var dateStr = ('0' + d.getDate()).slice(-2) + "/" +
            ('0' + (d.getMonth() + 1)).slice(-2) + "/" +
            d.getFullYear();
        return dateStr;
    },

    generateMonth: function(component) {
        var dayOfMonth = component.get("v.privateDate");
        var month = component.get("v.privateMonth");
        var year = component.get("v.privateYear");
        var date = new Date(year, month, dayOfMonth);

        var selectedDate = new Date(year, month, dayOfMonth);

        var today = new Date();
        var d = new Date();
        d.setDate(1);
        d.setFullYear(year);
        d.setMonth(month);
        // java days are indexed from 1-7, javascript 0-6
        // The startPoint will indicate the first date displayed at the top-left
        // corner of the calendar. Negative dates in JS will subtract days from
        // the 1st of the given month
        var firstDayOfWeek = $A.get("$Locale.firstDayOfWeek") - 1; // In Java, week day is 1 - 7
        var startDay = d.getDay();
        var firstFocusableDate;
        while (startDay !== firstDayOfWeek) {
            d.setDate(d.getDate() - 1);
            startDay = d.getDay();
        }
        for (var i = 0; i <= 41; i++) {
            var cellCmp = component.find(i);
            if (cellCmp) {
                var dayOfWeek = d.getDay();
                var tdClass = '';

                if (d.getMonth() === month - 1 || d.getFullYear() === year - 1) {
                    cellCmp.set("v.ariaDisabled", "true");
                    tdClass = 'slds-disabled-text';
                } else if (d.getMonth() === month + 1 || d.getFullYear() === year + 1) {
                    cellCmp.set("v.ariaDisabled", "true");
                    tdClass = 'slds-disabled-text';
                }

                if (d.getMonth() === month && d.getDate() === 1) {
                    firstFocusableDate = cellCmp;
                }

                if (this.dateEquals(d, today)) {
                    tdClass += ' slds-is-today';
                }

                if (this.dateEquals(d, selectedDate)) {
                    cellCmp.set("v.ariaSelected", "true");
                    tdClass += ' slds-is-selected';
                    firstFocusableDate = cellCmp;
                }

                cellCmp.set("v.tabIndex", -1);
                cellCmp.set("v.label", d.getDate());
                cellCmp.set("v.tdClass", tdClass);

                var dateStr = this.formatDate(d);
                cellCmp.set("v.value", dateStr);
            }

            d.setDate(d.getDate() + 1);
        }

        if (firstFocusableDate) {
            firstFocusableDate.set("v.tabIndex", 0);
        }
    },

    changeYear: function(component, newYear, date) {
        var currentMonth = component.get("v.privateMonth");
        var currentYear = component.get("v.privateYear");

        if (!currentYear) {
            currentYear = this.date.current.year();
        }

        var currentDate = new Date(currentYear, currentMonth, date);
        var targetDate = new Date(newYear, currentDate.getMonth(), 1);

        var daysInMonth = this.numDays(currentMonth, currentYear);

        if (daysInMonth < date) { // The target month doesn't have the current date. Just set it to the last date.
            date = daysInMonth;
        }

        this.setDateValues(component, targetDate, date);
    },

    handleManualDateChange: function(component) {
        var datestr = component.get("v.date");

        //if a person has deliberately cleared the date, respect that.
        if ($A.util.isEmpty(datestr)) {
            component.set("v.value", null);
            component.set("v.date", '');

            //finally fire the event to tell parent components we have changed the date:
            this.fireEvent(component, "onchange", {
                value: '',
            });
            return;
        }

        if(!moment(datestr, this.FORMAT).isValid()) {
            return;
        }

        var currentDate = this.parseInputDate(component, datestr);
        this.setDateValues(component, currentDate, currentDate.getDate());

        var selectedDate = new Date(component.get("v.privateYear"), component.get("v.privateMonth"), component.get("v.privateDate"));
        var dateStr = this.formatDate(selectedDate);
        component.set("v.value", selectedDate.getTime());
        component.set("v.date", dateStr);

        //finally fire the event to tell parent components we have changed the date:
        this.fireEvent(component, "onchange", {
            value: dateStr,
        });
    },

    selectDate: function(component, event) {
        var source = event.getSource();

        var firstDate = new Date(component.get("v.privateYear"), component.get("v.privateMonth"), 1);
        var firstDateId = parseInt(firstDate.getDay(), 10);

        // need to account for start of week differences when comparing indices
        var firstDayOfWeek = $A.get("$Locale.firstDayOfWeek") - 1; // The week days in Java is 1 - 7
        var offset = 0;
        if (firstDayOfWeek !== 0) {
            if (firstDateId >= firstDayOfWeek) {
                offset -= firstDayOfWeek;
            } else {
                offset += (7 - firstDayOfWeek);
            }
        }

        firstDateId += offset;
        var lastDate = new Date(component.get("v.privateYear"), component.get("v.privateMonth") + 1, 0);
        var lastDateCellCmp = this.findDateComponent(component, lastDate);
        var lastDateId = parseInt(lastDateCellCmp.getLocalId(), 10);
        lastDateId += offset;

        var currentId = parseInt(source.getLocalId(), 10);
        var currentDate = source.get("v.label");
        var targetDate;
        if (currentId < firstDateId) { // previous month
            targetDate = new Date(component.get("v.privateYear"), component.get("v.privateMonth") - 1, currentDate);
            this.setDateValues(component, targetDate, targetDate.getDate());

        } else if (currentId > lastDateId) { // next month
            targetDate = new Date(component.get("v.privateYear"), component.get("v.privateMonth") + 1, currentDate);
            this.setDateValues(component, targetDate, targetDate.getDate());

        } else {
            component.set("v.privateDate", currentDate);
        }
        var selectedDate = new Date(component.get("v.privateYear"), component.get("v.privateMonth"), component.get("v.privateDate"));
        var dateStr = this.formatDate(selectedDate);
        component.set("v.value", selectedDate.getTime());
        component.set("v.date", dateStr);

        //finally fire the event to tell parent components we have changed the date:
        this.fireEvent(component, "onchange", {
            value: dateStr,
        });
    },

    findDateComponent: function(component, date) {
        var firstDate = new Date(date.getTime());
        firstDate.setDate(1);
        var initialPos = firstDate.getDay();
        var pos = initialPos + date.getDate() - 1;

        return component.find(pos);
    },

    changeMonth: function(component, monthChange) {
        var currentYear = component.get("v.privateYear");
        var currentMonth = component.get("v.privateMonth");
        var currentDay = component.get("v.privateDate");

        var currentDate = new Date(currentYear, currentMonth, currentDay);
        var targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthChange, 1);

        var daysInMonth = this.numDays(currentMonth, currentYear);

        if (daysInMonth < currentDay) { // The target month doesn't have the current date. Just set it to the last date.
            currentDay = daysInMonth;
        }
        this.setDateValues(component, targetDate, currentDay);
    },

    goToToday: function(component, event) {
        var currentYear = this.date.current.year();
        var currentMonth = this.date.current.month.integer();
        var currentDay = this.date.current.day();

        var targetDate = new Date(currentYear, currentMonth, currentDay);
        this.setDateValues(component, targetDate, currentDay);
        var dateStr = this.formatDate(targetDate);

        component.set("v.value", targetDate.getTime());
        component.set("v.date", dateStr);

        //finally fire the event to tell parent components we have changed the date:
        this.fireEvent(component, "onchange", {
            value: dateStr,
        });
    },

    dateCompare: function(date1, date2) {
        if (date1.getFullYear() !== date2.getFullYear()) {
            return date1.getFullYear() - date2.getFullYear();
        } else {
            if (date1.getMonth() !== date2.getMonth()) {
                return date1.getMonth() - date2.getMonth();
            } else {
                return date1.getDate() - date2.getDate();
            }
        }
    },

    dateEquals: function(date1, date2) {
        return date1 && date2 && this.dateCompare(date1, date2) === 0;
    },

    goToFirstOfMonth: function(component) {
        var date = new Date(component.get("v.privateYear"), component.get("v.privateMonth"), 1);
        var targetId = date.getDay();
        var targetCellCmp = component.find(targetId);
        targetCellCmp.getElement().focus();
        component.set("v.privateDate", 1);
    },

    goToLastOfMonth: function(component) {
        var date = new Date(component.get("v.privateYear"), component.get("v.privateMonth") + 1, 0);
        var targetCellCmp = this.findDateComponent(component, date);
        if (targetCellCmp) {
            targetCellCmp.getElement().focus();
            component.set("v.privateDate", targetCellCmp.get("v.label"));
        }
    },

    isNumber: function(obj) {
        return !isNaN(parseFloat(obj));
    },

    numDays: function(currentMonth, currentYear) {
        // checks to see if february is a leap year otherwise return the respective # of days
        return currentMonth === 1 && (((currentYear % 4 === 0) && (currentYear % 100 !== 0)) || (currentYear % 400 === 0)) ? 29 : this.l10n.daysInMonth[currentMonth];
    },

    l10n: {
        weekdays: {
            shorthand: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            longhand: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        months: {
            shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            longhand: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        },
        daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        firstDayOfWeek: 0
    },

    date: {
        current: {
            year: function() {
                return new Date().getFullYear();
            },
            month: {
                integer: function() {
                    return new Date().getMonth();
                },
                string: function(shorthand) {
                    var month = new Date().getMonth();
                    return monthToStr(month, shorthand);
                }
            },
            day: function() {
                return new Date().getDate();
            }
        }
    },

    onClickOutsideDatePicker: function(component, event) {
        var isInDatePicker = window.$Utils.findFromEvent(event, "data-datepicker") === component.getGlobalId();

        if(!isInDatePicker) {
            this.hideDatePicker(component);
        }
    },

    showDatePicker: function(component) {
        var helper = this;
        var grid = component.find("grid");
        if (grid) {
            this.adjustPopupPosition(component);
            component.set("v.privateExpanded", true);

            component._clickListener = $A.getCallback(function(event) {
                helper.onClickOutsideDatePicker(component, event);
            });

            window.addEventListener("click", component._clickListener);
        }
    },

    hideDatePicker: function(component) {
        var grid = component.find("grid");
        if (grid) {
            component.set("v.privateExpanded", false);

            window.removeEventListener("click", component._clickListener);
        }
    },

    toggleDatePicker: function(component) {
        var grid = component.find("grid");
        if(!component.get("v.privateExpanded")) {
            this.showDatePicker(component);
        }
        else {
            this.hideDatePicker(component);
        }
    },
})
