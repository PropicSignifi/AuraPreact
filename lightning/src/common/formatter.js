(function(window) {
    const formatters = {};

    // addFormatter :: (String, Formatter) -> _
    const addFormatter = (name, formatter) => {
        if(_.isString(name) && _.isPlainObject(formatter)) {
            formatters[name] = formatter;
        }
        else {
            throw new Error("Invalid formatter with name " + name);
        }
    };

    // removeFormatter :: String -> _
    const removeFormatter = name => {
        delete formatters[name];
    };

    // getFormatter :: String -> Funtion
    const getFormatter = str => {
        const [name,] = _.split(str, ":");
        return formatters[name];
    };

    // getFormatterOptions :: String -> Options
    const getFormatterOptions = str => {
        const items = _.split(str, ":");
        if(_.size(items) > 1) {
            return {
                args: _.drop(items, 1),
            };
        }
        else {
            return null;
        }
    };

    // getFormatters :: () -> Formatters
    const getFormatters = () => formatters;

    // format :: (String, String, Options) -> String
    const format = (name, value, options) => {
        if(_.isUndefined(value)) {
            throw new Error("Needs to have formatter name and value to be formatted");
        }
        const formatter = getFormatter(name);
        const formatterOptions = getFormatterOptions(name);
        if(formatter) {
            return formatter.format(value, options || formatterOptions);
        }
        else {
            return value;
        }
    };

    // parse :: (String, String, Options) -> String
    const parse = (name, value, options) => {
        if(_.isUndefined(value)) {
            throw new Error("Needs to have formatter name and value to be parsed");
        }
        const formatter = getFormatter(name);
        if(formatter) {
            return formatter.parse(value, options);
        }
        else {
            return value;
        }
    };

    // getFormatterNames :: () -> [String]
    const getFormatterNames = () => Object.keys(formatters);

    // add basic formatters
    addFormatter("BSB", {
        format: function(str) {
            if(_.size(str) === 6) {
                return str.substring(0, 3) + "-" + str.substring(3);
            }
            else {
                return str;
            }
        },
        parse: function(str) {
            return _.replace(str, /-/g, "");
        },
    });

    /*
     * Options are useful when format style is 'decimal':
     * 
     * step
     * defaultValue
     */
    // numberFormatter :: String -> String -> Options -> String
    const numberFormatter = _.curry((formatStyle, value, options) => {
        options = options || {};
        if (value === null || value === undefined || value === '') {
            return '';
        }
        var formattedValue = value;

        var formatOptions = {
            style: formatStyle
        };

        var step = options.step;

        if (formatStyle === 'decimal' && step && step !== 'any') {
            var decimals = String(step).split(".")[1];
            var numDecimals = decimals ? decimals.length : 0;

            formatOptions.minimumFractionDigits = numDecimals;
            formatOptions.maximumFractionDigits = numDecimals;
        }

        try {
            formattedValue = window.$IntlLibrary.numberFormat(formatOptions).format(value) || options.defaultValue || '';
        } catch (ignore) {}
        return formattedValue;
    });
    addFormatter("decimal", {
        format: numberFormatter("decimal"),
        parse: function(value) {
            if(!value) {
                return value;
            }
            return Number(_.replace(value, /[^-0-9.]/g, ""));
        },
    });
    addFormatter("currency", {
        format: numberFormatter("currency"),
        parse: function(value) {
            if(!value) {
                return value;
            }
            return Number(_.replace(value, /[^-0-9.]/g, ""));
        },
    });
    addFormatter("percent", {
        format: numberFormatter("percent"),
        parse: function(value) {
            return value;
        },
    });

    const getDateTimeFormat = type => {
        switch(type) {
            case 'date':
                return window.$Config.getDateFormat();
            case 'time':
                return window.$Config.getTimeFormat();
            case 'datetime':
                return window.$Config.getDateTimeFormat();
            case 'datetime-short':
                return window.$Config.getDateTimeShortFormat();
            case 'datetime-normal':
                return window.$Config.getDateTimeNormalFormat();
            case 'time-normal':
                return window.$Config.getTimeNormalFormat();
            default:
                return window.$Config.getDateTimeFormat();
        }
    };

    const formatDate = (value, type) => {
        const format = getDateTimeFormat(type || "date");
        return moment(value).format(format);
    };

    const parseDate = (value, type) => {
        const format = getDateTimeFormat(type || "date");
        return moment(value, format).toDate().getTime();
    };

    addFormatter("datetime", {
        format: function(value, options) {
            if(!value) {
                return "";
            }
            return formatDate(value, options && options.type);
        },
        parse: function(value, options) {
            return parseDate(value, options && options.type);
        },
    });

    // getCode :: String -> String
    const getCode = countryCode => {
        const regionCode = phoneUtils.countryCodeToRegionCodeMap()[_.parseInt(countryCode)];
        const code = _.isEmpty(regionCode) ? "" : regionCode[0];
        return code;
    };

    addFormatter("phone", {
        format: function(value, options = {}) {
            const args = options.args;
            if(_.isEmpty(args)) {
                return value;
            }
            else {
                const code = getCode(args[0]);

                try {
                    if(phoneUtils.isValidNumber(value, code)) {
                        const formattedValue = phoneUtils.formatInternational(value, code);
                        const items = _.split(formattedValue, " ");
                        return _.drop(items, 1).join(" ");
                    }
                }
                catch(e) {
                }

                return value;
            }
        },
        parse: function(value, options = {}) {
            return value;
        },
        isValid: function(value, options = {}) {
            if(!value) {
                return true;
            }
            const args = options.args;
            if(_.isEmpty(args)) {
                return true;
            }
            else {
                const requiredType = args[1];
                const code = getCode(args[0]);

                try {
                    if(phoneUtils.isValidNumber(value, code)) {
                        const phoneNumber = phoneUtils.formatInternational(value, code);
                        const type = phoneUtils.getNumberType(phoneNumber);
                        return requiredType ? _.toLower(requiredType) === _.toLower(type) : true;
                    }
                }
                catch(e) {
                }

                return false;
            }
        },
        getFullValue: function(value, options = {}) {
            const args = options.args;
            if(_.isEmpty(args)) {
                return value;
            }
            else {
                const code = getCode(args[0]);

                try {
                    if(phoneUtils.isValidNumber(value, code)) {
                        return phoneUtils.formatInternational(value, code);
                    }
                }
                catch(e) {
                }

                return "+" + args[0] + " " + value;
            }
        },
        getNumberType: function(value) {
            const type = phoneUtils.getNumberType(value);
            return _.toLower(type);
        },
    });

    // add to data producers
    window.$DataProducer.addDataProducer("formatters", {
        produce: function() {
            return [
                "",
                ...getFormatterNames().sort(),
            ].map(name => {
                return {
                    label: name || '- Select -',
                    value: name,
                };
            });
        },
    });

    const $Formatter = {
        addFormatter,
        removeFormatter,
        getFormatter,
        getFormatterOptions,
        getFormatters,
        getFormatterNames,
        format,
        parse,
    };

    window.$Formatter = $Formatter;
})(window);
