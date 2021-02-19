/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
import { utils } from './IntlLibrary.utils.js';

function getDiffInMinutes(timestamp1, timestamp2) {
    return (timestamp2 - timestamp1) / MINUTE_MILLISECONDS;
}
var localeTag = utils.getLocaleTag();
var MINUTE_MILLISECONDS = 1E3 * 60;

export const relativeNumber = function() {
    return {
        format: function(value) {
            var now = Date.now();
            var timestamp = Number(value);
            if (isFinite(timestamp)) {
                return moment.duration(getDiffInMinutes(now, timestamp), "minutes").locale(localeTag).humanize(true);
            }
            throw new TypeError("The value passed to format func must be type" + ' Date object or a timestamp; and we are getting "' + value + '" as a value.');
        }
    };
};
