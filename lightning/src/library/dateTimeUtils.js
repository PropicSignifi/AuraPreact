/*
 * Regex to test a string for an ISO8601 Date. The following formats are matched.
 * Note that if a time element is present (e.g. 'T'), the string should have a time zone designator (Z or +hh:mm or -hh:mm).
 *
 *  YYYY
 *  YYYY-MM
 *  YYYY-MM-DD
 *  YYYY-MM-DDThh:mmTZD
 *  YYYY-MM-DDThh:mm:ssTZD
 *  YYYY-MM-DDThh:mm:ss.sTZD
 *
 * @see: https://www.w3.org/TR/NOTE-datetime
 */
const ISO_8601_FORMAT = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z){1})?)?)?$/i;

export function parseISODateTimeString(dateString) {
    // Date.parse returns NaN if the argument doesn't represent a valid date
    const timeStamp = Date.parse(dateString);
    if (isFinite(timeStamp) && ISO_8601_FORMAT.test(dateString)) {
        return timeStamp;
    }
    return null;
}
