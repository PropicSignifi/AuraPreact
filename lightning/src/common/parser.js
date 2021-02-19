(function(window) {
    const parsers = {};

    // addParser :: (String, String) -> _
    const addParser = (name, syntax) => {
        if(_.isString(name)) {
            if(_.isString(syntax)) {
                const parser = window.peg.generate(syntax);
                parsers[name] = parser;
            }
            else {
                parsers[name] = syntax;
            }
        }
        else {
            throw new Error("Failed to add parser");
        }
    };

    // removeParser :: String -> _
    const removeParser = name => {
        delete parsers[name];
    };

    // getParser :: String -> Parser
    const getParser = name => parsers[name];

    // getParsers :: () -> Parsers
    const getParsers = () => parsers;

    // isEnabled :: () -> Boolean
    const isEnabled = () => {
        return !!window.peg;
    };

    // parse :: (String, String) -> [Parsed]
    const parse = (name, expression) => {
        const parser = getParser(name);
        if(parser) {
            return parser.parse(expression);
        }
        else {
            throw new Error("Invalid parser: " + name);
        }
    };

    // Add default syntax
    if(isEnabled()) {
        addParser('default', window.$LIGHTNING_EXPRESSION_SYNTAX);
    }

    const $Parser = {
        addParser,
        removeParser,
        getParser,
        getParsers,
        isEnabled,
        parse,
    };

    window.$Parser = $Parser;
})(window);
