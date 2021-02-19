/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
import { $get } from './safe.js';

function getLocaleTag() {
    var localeLanguage = $get("$Locale.language");
    var localeCountry = $get("$Locale.userLocaleCountry");
    if (!localeLanguage) {
        return $get("$Locale.langLocale").replace(/_/g, "-");
    }
    return localeLanguage + (localeCountry ? "-" + localeCountry : "");
}

export const utils = {
    getLocaleTag: getLocaleTag
};
