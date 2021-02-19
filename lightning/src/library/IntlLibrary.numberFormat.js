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

function NumberOptions(options) {
    this.locale = $get("$Locale");
    this.options = options || {};
}

function getDefaultSkeleton() {
    return this.isCurrency() ? this.locale.currencyFormat : this.isPercent() ? this.locale.percentFormat : this.locale.numberFormat;
}

function updateFractionPart(skeleton) {
    var fractionPart = getFractionPart.call(this);
    return fractionPart ? skeleton.replace(/\.(0|#){0,}/, fractionPart) : skeleton;
}

function getFractionPart() {
    var minimumDigits = this.options.minimumFractionDigits;
    var maximumDigits = this.options.maximumFractionDigits;
    if (!minimumDigits && !maximumDigits) {
        return undefined;
    }
    if (!minimumDigits) {
        minimumDigits = 0;
    }
    if (!maximumDigits) {
        maximumDigits = minimumDigits;
    }
    return "." + (new Array(minimumDigits + 1)).join("0") + (new Array(maximumDigits - minimumDigits + 1)).join("#");
}

function getBestMatchCurrencySymbol(code, currencyDisplay) {
    if (!("Intl"in window)) {
        return code;
    } else {
        var nf;
        var opts = {
            style: "currency",
            currency: code,
            minimumFractionDigits: 0
        };
        if (currencyDisplay) {
            opts.currencyDisplay = currencyDisplay;
        }
        nf = getFromCache(opts);
        return nf.format(2).replace(/2/g, "");
    }
}

function getCurrency(options) {
    var currencyDisplay = options.currencyDisplay || CURRENCY_DISPLAY.SYMBOL;
    if (currencyDisplay === CURRENCY_DISPLAY.SYMBOL || currencyDisplay === CURRENCY_DISPLAY.NAME) {
        return getBestMatchCurrencySymbol(options.currency, currencyDisplay);
    } else {
        return options.currency;
    }
}

function updateCurrencySymbol(skeleton, currencyCode, options) {
    var symbol = String.fromCharCode(164);
    if (options.currencyDisplay === CURRENCY_DISPLAY.NAME) {
        return skeleton.replace(symbol, "") + currencyCode;
    }
    return skeleton.replace(symbol, currencyCode);
}

function updateIntegerPart(skeleton) {
    var minimumIntegerDigits = this.options.minimumIntegerDigits;
    var groupingCount = getGroupingCount(skeleton);
    if (!minimumIntegerDigits) {
        return skeleton;
    }
    if (minimumIntegerDigits <= groupingCount) {
        return skeleton.replace(/\,[#0]{0,}\./, "," + getStringOfChar("#", groupingCount - minimumIntegerDigits) + getStringOfChar("0", minimumIntegerDigits) + ".");
    }
    return skeleton.replace(/[#0]{0,}\./, getStringOfChar("0", minimumIntegerDigits - groupingCount) + "," + getStringOfChar("0", groupingCount) + ".");
}

function getStringOfChar(char, amount) {
    return (new Array(amount + 1)).join(char);
}

function getGroupingCount(skeleton) {
    var match = skeleton.match(/\,[#0]{0,}\./);
    return match ? match[0].length - 2 : 0;
}

function fallback(options) {
    var skeleton = (new NumberOptions(options)).getSkeleton();
    return {
        format: function(value) {
            return $A.localizationService.getNumberFormat(skeleton).format(value);
        }
    };
}

function getFromCache(options) {
    var optionsUniqueKey = getOptionsUniqueKey(options);
    var numberFormatInstance = numberFormatInstancesCache[optionsUniqueKey];
    if (numberFormatInstance) {
        return numberFormatInstance;
    }
    numberFormatInstance = new Intl.NumberFormat(locale,options);
    numberFormatInstancesCache[optionsUniqueKey] = numberFormatInstance;
    return numberFormatInstance;
}

function exceedsSafeLength(value, maxFractionDigits) {
    var str = value.toString();
    var intPart = str.split($get("$Locale.decimal"))[0];
    return intPart.length + maxFractionDigits >= SAFE_NUM_LENGTH;
}

function normalizedMinimumFractionDigits(options) {
    var fractionSkeleton = getFallbackFractionSkeleton(options.style);
    var fractionDigits = fractionSkeleton.replace(/[^0]/g, "");
    return fractionDigits.length;
}

function normalizedMaximumFractionDigits(options) {
    var fractionSkeleton = getFallbackFractionSkeleton(options.style);
    var fractionDigits = fractionSkeleton.replace(/[^0#]/g, "");
    return Math.max(options.minimumFractionDigits, fractionDigits.length);
}

function getFallbackFractionSkeleton(style) {
    var styleFormat = "$Locale.numberFormat";
    var parts;
    if (style === STYLE.CURRENCY) {
        styleFormat = "$Locale.currencyFormat";
    } else {
        if (style === STYLE.PERCENT) {
            styleFormat = "$Locale.percentFormat";
        }
    }
    parts = $get(styleFormat).split(".");
    return parts[1] || "";
}

function normalizeOptions(options) {
    var normalizedOpts = Object.assign({}, options);
    normalizedOpts.currency = normalizedOpts.currency || defaultUserCurrencyCode;
    if (normalizedOpts.minimumFractionDigits === undefined) {
        normalizedOpts.minimumFractionDigits = normalizedMinimumFractionDigits(normalizedOpts);
    }
    if (normalizedOpts.maximumFractionDigits === undefined || normalizedOpts.maximumFractionDigits < normalizedOpts.minimumFractionDigits) {
        normalizedOpts.maximumFractionDigits = normalizedMaximumFractionDigits(normalizedOpts);
    }
    return normalizedOpts;
}

var locale = utils.getLocaleTag();
var defaultUserCurrencyCode = $get("$Locale.currencyCode");
var numberFormatInstancesCache = {};
var POSSIBLE_OPTS = {
    style: true,
    currency: true,
    currencyDisplay: true,
    useGroup: true,
    minimumIntegerDigits: true,
    minimumFractionDigits: true,
    maximumFractionDigits: true,
    minimumSignificantDigits: true,
    maximumSignificantDigits: true
};
var STYLE = {
    DECIMAL: "decimal",
    CURRENCY: "currency",
    PERCENT: "percent"
};
var CURRENCY_DISPLAY = {
    CODE: "code",
    SYMBOL: "symbol",
    NAME: "name"
};
var SAFE_NUM_LENGTH = 15;
NumberOptions.prototype.isCurrency = function() {
    return this.options.style === "currency";
}
;
NumberOptions.prototype.isPercent = function() {
    return this.options.style === "percent";
}
;
NumberOptions.prototype.isDefaultCurrency = function() {
    return !this.options.currency || this.locale.currencyCode === this.options.currency;
}
;
NumberOptions.prototype.getSkeleton = function() {
    var options = this.options;
    var defaultSkeleton = getDefaultSkeleton.call(this);
    var skeleton = updateFractionPart.call(this, defaultSkeleton);
    skeleton = updateIntegerPart.call(this, skeleton);
    if (!this.isDefaultCurrency()) {
        skeleton = updateCurrencySymbol(skeleton, getCurrency(options), options);
    }
    return skeleton;
}
;
export const numberFormat = function(options) {
    var numberFormatInstance;
    var normalizedOpts = Object.assign({}, normalizeOptions(options));
    if (!("Intl"in window)) {
        return fallback(normalizedOpts);
    }
    return {
        format: function(value) {
            if (value && exceedsSafeLength(value, normalizedOpts.maximumFractionDigits)) {
                return fallback(normalizedOpts).format(value);
            }
            numberFormatInstance = getFromCache(normalizedOpts);
            return numberFormatInstance.format(value);
        }
    };
};
