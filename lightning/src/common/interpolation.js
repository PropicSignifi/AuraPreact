(function(window) {
    const cache = {};
    const INTERPOLATION_REGEX = "{(.*?)}";

    // parse :: String -> Object
    const parse = template => {
        if(!template) {
            return template;
        }
        if(cache[template]) {
            return cache[template];
        }
        else {
            const params = [];
            let xArray;
            let regex = new RegExp(INTERPOLATION_REGEX, "g");
            while((xArray = regex.exec(template))) {
                params.push(xArray[1]);
            }
            cache[template] = {
                template,
                params,
            };

            return cache[template];
        }
    };

    // evaluate :: (Parsed, Context) -> String
    const evaluate = (parsed, context) => {
        return _.reduce(parsed.params, (prev, param) => {
            return _.replace(prev, `{${param}}`, _.toString(context[param] || ""));
        }, parsed.template);
    };

    // isInterpolation :: String -> Boolean
    const isInterpolation = template => {
        return new RegExp(INTERPOLATION_REGEX).test(template);
    };

    const $Interpolation = {
        parse,
        evaluate,
        isInterpolation,
    };

    window.$Interpolation = $Interpolation;
})(window);
