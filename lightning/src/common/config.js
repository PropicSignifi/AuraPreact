(function(window) {
    // Remember to update related config if a new date time format is added
    const config = {
        staticResourceName: "ctcPropertyLightning",
        dateFormat: "DD/MM/YYYY", // moment format
        datetimeFormat: "DD/MM/YYYY HH:mm:ss", // moment format
        datetimeShortFormat: "h:mm A DD/MM/YYYY", // moment format
        datetimeNormalFormat: "DD/MM/YYYY h:mm A", // moment format
        timeFormat: "HH:mm:ss", // moment format
        timeNormalFormat: "HH:mm a", // moment format
    };

    // getBasePath :: () -> String
    const getBasePath = () => {
        if(window.$A) {
            return window.$A.get(`$Resource.${window.$NAME_SPACE_PREFIX}${config.staticResourceName}`);
        }
        else {
            return "";
        }
    };

    // setNamespace :: String -> _
    const setNamespace = namespace => config.namespace = namespace;

    // getNamespace :: () -> String
    const getNamespace = () => {
        return config.namespace || window.$NAME_SPACE;
    };

    // getDateFormat :: () -> String
    const getDateFormat = () => config.dateFormat;

    // getTimeFormat :: () -> String
    const getTimeFormat = () => config.timeFormat;

    // getTimeNormalFormat :: () -> String
    const getTimeNormalFormat = () => config.timeNormalFormat;

    // getDateTimeFormat :: () -> String
    const getDateTimeFormat = () => config.datetimeFormat;

    // getDateTimeShortFormat :: () -> String
    const getDateTimeShortFormat = () => config.datetimeShortFormat;

    const getDateTimeNormalFormat = () => config.datetimeNormalFormat;

    const isDevEnv = () => window.$NAME_SPACE === 'c';

    const getConfig = () => config;

    window.$Config = {
        getBasePath,
        setNamespace,
        getNamespace,
        getDateFormat,
        getTimeFormat,
        getTimeNormalFormat,
        getDateTimeFormat,
        getDateTimeShortFormat,
        getDateTimeNormalFormat,
        isDevEnv,
        getConfig,
    };
})(window);
