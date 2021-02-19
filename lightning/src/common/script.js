(function(window) {
    const cache = {};

    // parse :: String -> ParseTree
    const parse = script => {
        if(!script) {
            return script;
        }
        if(cache[script]) {
            return cache[script];
        }
        else {
            cache[script] = jsep(script);
            return cache[script];
        }
    };

    // evaluateLiteral :: (Node, Context) -> Object
    const evaluateLiteral = (node, context) => {
        return node.value;
    };

    // evaluateThis :: (Node, Context) -> Object
    const evaluateThis = (node, context) => {
        return context;
    };

    // evaluateIdentifier :: (Node, Context) -> Object
    const evaluateIdentifier = (node, context) => {
        if(!context) {
            throw new Error("Context is not available");
        }
        return context[node.name];
    };

    // evaluateMemberExpression :: (Node, Context) -> Object
    const evaluateMemberExpression = (node, context) => {
        const object = node.object;
        const property = node.property;
        const objectValue = evaluate(object, context);
        if(node.computed) {
            const propertyValue = evaluate(property, context);
            return _.isFunction(objectValue[propertyValue]) ?
                objectValue[propertyValue].bind(objectValue) :
                objectValue[propertyValue];
        }
        else {
            const propertyValue = property.name;
            return _.isFunction(objectValue[propertyValue]) ?
                objectValue[propertyValue].bind(objectValue) :
                objectValue[propertyValue];
        }
    };

    // evaluateCallExpression :: (Node, Context) -> Object
    const evaluateCallExpression = (node, context) => {
        const args = node.arguments;
        const callee = node.callee;
        const calleeValue = evaluate(callee, context);
        const argsValue = _.map(args, arg => {
            return evaluate(arg, context);
        });
        if(calleeValue) {
            return calleeValue.apply(null, argsValue);
        }
        else {
            throw new Error("Cannot find function for " + callee);
        }
    };

    // evaluateLogicalExpression :: (Node, Context) -> Object
    const evaluateLogicalExpression = (node, context) => {
        const operator = node.operator;
        const left = evaluate(node.left, context);
        const right = evaluate(node.right, context);
        switch(operator) {
            case '&&':
                return left && right;
            case '||':
                return left || right;
            default:
                throw new Error("Unsupported logical expression: " + operator);
        }
    };

    // evaluateUnaryExpression :: (Node, Context) -> Object
    const evaluateUnaryExpression = (node, context) => {
        const operator = node.operator;
        const argument = evaluate(node.argument, context);
        switch(operator) {
            case '-':
                return -argument;
            case '!':
                return !argument;
            default:
                throw new Error("Unsupported unary expression: " + operator);
        }
    };

    // evaluateBinaryExpression :: (Node, Context) -> Object
    const evaluateBinaryExpression = (node, context) => {
        const operator = node.operator;
        const left = evaluate(node.left, context);
        const right = evaluate(node.right, context);
        switch(operator) {
            case '+':
                return left + right;
            case '-':
                return left - right;
            case '*':
                return left * right;
            case '/':
                return left / right;
            case '%':
                return left % right;
            default:
                throw new Error("Unsupported binary expression: " + operator);
        }
    };

    // evaluateConditionalExpression :: (Node, Context) -> Object
    const evaluateConditionalExpression = (node, context) => {
        const test = evaluate(node.test, context);
        const consequent = evaluate(node.consequent, context);
        const alternate = evaluate(node.alternate, context);
        return test ? consequent : alternate;
    };

    // evaluateArrayExpression :: (Node, Context) -> Object
    const evaluateArrayExpression = (node, context) => {
        return _.map(node.elements, function(element) {
            return evaluate(element, context);
        });
    };

    // evaluateCompoundExpression :: (Node, Context) -> Object
    const evaluateCompoundExpression = (node, context) => {
        return _.map(node.body, function(element) {
            return evaluate(element, context);
        });
    };

    // evaluate :: (Node, Context) -> Object
    const evaluate = (node, context) => {
        switch(node.type) {
            case 'Literal':
                return evaluateLiteral(node, context);
            case 'ThisExpression':
                return evaluateThis(node, context);
            case 'Identifier':
                return evaluateIdentifier(node, context);
            case 'MemberExpression':
                return evaluateMemberExpression(node, context);
            case 'CallExpression':
                return evaluateCallExpression(node, context);
            case 'LogicalExpression':
                return evaluateLogicalExpression(node, context);
            case 'UnaryExpression':
                return evaluateUnaryExpression(node, context);
            case 'BinaryExpression':
                return evaluateBinaryExpression(node, context);
            case 'ConditionalExpression':
                return evaluateConditionalExpression(node, context);
            case 'ArrayExpression':
                return evaluateArrayExpression(node, context);
            case 'Compound':
                return evaluateCompoundExpression(node, context);
            default:
                throw new Error("Unsupported node type: " + node.type);
        }
    };

    const $Script = {
        parse,
        evaluate,
    };

    window.$Script = $Script;
})(window);
