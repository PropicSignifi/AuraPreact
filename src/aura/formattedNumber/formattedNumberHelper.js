({
    getFormattedNumber: function(cmp) {
        var value = cmp.get("v.value");
        var type = cmp.get("v.type");
        var isUndefined = value === undefined;
        var isNull = value === null;
        var isEmptyString = value === "";
        var options;

        if (isUndefined || isNull || isEmptyString) {
            return "";
        }

        if (isFinite(value)) {
            if(type === "currency") {
                options = {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                };
                return "$" + this.IntlLibrary.numberFormat(options).format(value);
            }
            else {
                options = this.getOptions(cmp);
                return this.IntlLibrary.numberFormat(options).format(value);
            }
        } else {
            throw new Error('<c:formattedNumber value="..." ... /> require as a value ' + ' a number and we are getting "' + value + '" as a value.');
        }
    },

    getOptions: function(cmp) {
        return {
            style: cmp.get("v.style"),
            currency: cmp.get("v.currencyCode"),
            currencyDisplay: cmp.get("v.currencyDisplayAs"),
            minimumIntegerDigits: cmp.get("v.minimumIntegerDigits"),
            minimumFractionDigits: cmp.get("v.minimumFractionDigits"),
            maximumFractionDigits: cmp.get("v.maximumFractionDigits"),
            minimumSignificantDigits: cmp.get("v.minimumSignificantDigits"),
            maximumSignificantDigits: cmp.get("v.maximumSignificantDigits")
        };
    },
})
