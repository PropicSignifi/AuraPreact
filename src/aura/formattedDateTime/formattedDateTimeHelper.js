({
    getFormat: function(type) {
        switch(type) {
            case 'date':
                return window.$Config.getDateFormat();
            case 'time':
                return window.$Config.getTimeFormat();
            case 'datetime':
                return window.$Config.getDateTimeFormat();
            case 'datetime-short':
                return window.$Config.getDateTimeShortFormat();
            default:
                return window.$Config.getDateTimeFormat();
        }
    },

    getFormattedDateTime: function(cmp) {
        var value = cmp.get("v.value");
        var isUndefined = value === undefined;
        var isNull = value === null;
        var isEmptyString = value === "";

        var isEmptyValue = isUndefined || isNull || isEmptyString;

        var type = cmp.get("v.type");
        if(type && value) {
            var format = this.getFormat(type);
            var m;
            if(_.isString(value)) {
                m = moment(_.parseInt(value));
            }
            else {
                m = moment(value);
            }
            return m.format(format);
        }
        else {
            var options = this.getOptions(cmp);
            if (!isEmptyValue && isFinite(value)) {
                return this.IntlLibrary.dateTimeFormat(options).format(value);
            }

            var timeStamp = this.dateTimeUtils.parseISODateTimeString(value);
            if (timeStamp) {
                return this.IntlLibrary.dateTimeFormat(options).format(timeStamp);
            }
        }

        var errorMsg = '<c:formattedDateTime> the value attribute accepts either a Date object, a timestamp, or a valid ISO8601 formatted string ' + 'with timezone offset. but we are getting the value "' + value + '" instead.';
        console.warn(errorMsg);
        return '';
    },

    getOptions: function(cmp) {
        return {
            hour12: cmp.get("v.hour12"),
            weekday: cmp.get("v.weekday"),
            era: cmp.get("v.era"),
            year: cmp.get("v.year"),
            month: cmp.get("v.month"),
            day: cmp.get("v.day"),
            hour: cmp.get("v.hour"),
            minute: cmp.get("v.minute"),
            second: cmp.get("v.second"),
            timeZoneName: cmp.get("v.timeZoneName"),
            timeZone: cmp.get("v.timeZone")
        };
    },
})
