/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
import { utils } from './IntlLibrary.utils.js';
import { $get } from './safe.js';

function getOptionsUniqueKey(options) {
    return Object.keys(options).sort().reduce(function(prev, optionName) {
        if (POSSIBLE_OPTS[optionName]) {
            return prev + optionName + options[optionName] + "";
        }
        return prev;
    }, "");
}

function DateTimeOptions(options) {
    this.options = options || {};
}

function getWeekDayPart(format, options) {
    var weekdayOptionValue = options.weekday;
    if (formatMap.weekday[weekdayOptionValue] !== undefined) {
        format.push(formatMap.weekday[weekdayOptionValue]);
    }
}

function getMonthPart(format, options) {
    var monthOptionValue = options.month;
    if (formatMap.month[monthOptionValue] !== undefined) {
        format.push(formatMap.month[monthOptionValue]);
    }
}

function getDayPart(format, options) {
    var dayOptionValue = options.day;
    if (formatMap.day[dayOptionValue] !== undefined) {
        format.push(formatMap.day[dayOptionValue]);
    }
}

function getYearPart(format, options) {
    var yearOptionValue = options.year;
    if (formatMap.year[yearOptionValue] !== undefined) {
        format.push(formatMap.year[yearOptionValue]);
    }
}

function getTimePart(format, options) {
    var hourOptionValue = options.hour;
    var minuteOptionValue = options.minute;
    var secondOptionValue = options.second;
    var hasTime = false;
    var hasHourOnly = false;
    if (hourOptionValue === "numeric" || hourOptionValue === "2-digit") {
        hasTime = true;
        if (options.hour12 === false) {
            if (hourOptionValue === "numeric") {
                format.push(formatMap.hour.numeric24);
            } else {
                format.push(formatMap.hour["2-digit24"]);
            }
        } else {
            if (hourOptionValue === "numeric") {
                format.push(formatMap.hour.numeric12);
            } else {
                format.push(formatMap.hour["2-digit12"]);
            }
        }
        if (formatMap.minute[minuteOptionValue] !== undefined) {
            format.push(":");
        } else {
            if (formatMap.second[secondOptionValue] !== undefined) {
                hasHourOnly = true;
            }
        }
    }
    if (formatMap.minute[minuteOptionValue] !== undefined) {
        hasTime = true;
        format.push(formatMap.minute[minuteOptionValue]);
        if (formatMap.second[secondOptionValue] !== undefined) {
            format.push(":");
        }
    }
    if (formatMap.second[secondOptionValue] !== undefined && !hasHourOnly) {
        hasTime = true;
        format.push(formatMap.second[secondOptionValue]);
    }
    if (hasTime) {
        format.push(" a ");
    }
    if (hasHourOnly) {
        format.push("[(sec]: " + formatMap.second[secondOptionValue] + "[)]");
    }
}

function getTZPart(format, options) {
    var timeZoneNameOptionValue = options.timeZoneName;
    if (formatMap.timeZoneName[timeZoneNameOptionValue] !== undefined) {
        if (options.timeZone === "UTC") {
            format.push("[GMT]");
        } else {
            format.push(formatMap.timeZoneName[timeZoneNameOptionValue]);
        }
    }
}

function fallback(options) {
    var dto = new DateTimeOptions(options);
    var skeleton = dto.getSkeleton();
    var formatLocal = function(date, format) {
        var translatedDate = $A.localizationService.translateToOtherCalendar(date);
        return $A.localizationService.formatDate(translatedDate, format, getDefaultLocale());
    };

    return {
        format: function(value) {
            var dateObj = null;
            if (Object.prototype.toString.call(value) !== "[object Date]" && typeof value === "string") {
                dateObj = new Date(parseInt(value, 10));
            } else {
                dateObj = value;
            }
            if (options.timeZone === "UTC") {
                dateObj.setTime(dateObj.getTime() + dateObj.getTimezoneOffset() * 60 * 1E3);
            }
            if (!dto.hasFormattingOptions()) {
                return formatLocal(dateObj, getDefaultFormat());
            } else {
                return formatLocal(dateObj, skeleton);
            }
        },
        injectDependencyForTesting: _injectDependencyForTesting
    };
}

var locale = utils.getLocaleTag();
var dateFormat = $get("$Locale.dateFormat");
var getDefaultLocale = function() {
    return locale.replace(/-/g, "_");
};
var getDefaultFormat = function() {
    return dateFormat;
};
var dateTimeFormatInstancesCache = {};
var POSSIBLE_OPTS = {
    weekday: true,
    era: true,
    year: true,
    month: true,
    day: true,
    hour: true,
    minute: true,
    second: true,
    timeZone: true,
    timeZoneName: true,
    hour12: true
};
var FORMATTING_OPTS = ["weekday", "year", "month", "day", "hour", "minute", "second"];
var formatMap = {
    weekday: {
        "short": "EEE, ",
        narrow: "EEE, ",
        "long": "EEEE, "
    },
    month: {
        "short": "MMM ",
        narrow: "MMM ",
        numeric: "MMM ",
        "2-digit": "MMM ",
        "long": "MMMM "
    },
    day: {
        numeric: "d, ",
        "2-digit": "dd, "
    },
    year: {
        numeric: "yyyy ",
        "2-digit": "yy "
    },
    hour: {
        numeric12: "h",
        numeric24: "H",
        "2-digit12": "hh",
        "2-digit24": "HH"
    },
    minute: {
        numeric: "mm",
        "2-digit": "mm"
    },
    second: {
        numeric: "ss",
        "2-digit": "ss"
    },
    timeZoneName: {
        "short": "[GMT]Z",
        "long": "[GMT]Z"
    }
};
var separators = [",", " ", ":"];
DateTimeOptions.prototype.hasFormattingOptions = function() {
    var that = this;
    return FORMATTING_OPTS.some(function(element) {
        return that.options[element] !== undefined;
    });
}
;
DateTimeOptions.prototype.getSkeleton = function() {
    var format = [];
    getWeekDayPart(format, this.options);
    getMonthPart(format, this.options);
    getDayPart(format, this.options);
    getYearPart(format, this.options);
    getTimePart(format, this.options);
    getTZPart(format, this.options);
    var formatStr = format.join("");
    separators.forEach(function(element) {
        if (formatStr.lastIndexOf(element) === formatStr.length - 1) {
            formatStr = formatStr.slice(0, -1);
        }
    });
    return formatStr;
}
;
var _injectDependencyForTesting = {
    getDefaultLocale: function(_fn) {
        getDefaultLocale = _fn;
    },
    getDefaultFormat: function(_fn) {
        getDefaultFormat = _fn;
    }
};

export const dateTimeFormat = function(options) {
    options = options || {};
    var optionsUniqueKey = getOptionsUniqueKey(options);
    var dtf = dateTimeFormatInstancesCache[optionsUniqueKey];
    if (!("Intl" in window)) {
        return fallback(options);
    }
    if (!dtf) {
        dtf = new Intl.DateTimeFormat(locale,options);
        dateTimeFormatInstancesCache[optionsUniqueKey] = dtf;
    }

    return {
        format: function(value) {
            return dtf.format(value);
        },

        injectDependencyForTesting: _injectDependencyForTesting,
    };
};
