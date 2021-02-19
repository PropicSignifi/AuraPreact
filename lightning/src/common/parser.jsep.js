(function(window) {
    // evaluateLiteral :: (Node, [String], Component) -> Result
    const evaluateLiteral = (node, paths, contextCmp) => {
        return {
            code: function(cmp, fn) {
                return node.value;
            },
            path: node.value,
        };
    };

    // evaluateThis :: (Node, [String], Component) -> Result
    const evaluateThis = (node, paths, contextCmp) => {
        throw new Error("'this' is not supported");
    };

    // getFromCmp :: (String, Component, Component) -> Object
    const getFromCmp = (key, cmp, contextCmp) => {
        try {
            return contextCmp.get(key);
        }
        catch(e) {
            return cmp.get(key);
        }
    };

    // evaluateIdentifier :: (Node, [String], Component) -> Result
    const evaluateIdentifier = (node, paths, contextCmp) => {
        return {
            code: function(cmp, fn) {
                if(fn[node.name]) {
                    return fn[node.name];
                }
                return getFromCmp(node.name, cmp, contextCmp);
            },
            path: node.name,
        };
    };

    // evaluateMemberExpression :: (Node, [String], Component) -> Result
    const evaluateMemberExpression = (node, paths, contextCmp) => {
        const object = node.object;
        const property = node.property;
        const objectValue = evaluate(object, paths, contextCmp);
        if(node.computed) {
            throw new Error("Computed member expression is not supported");
        }
        else {
            const propertyValue = property.name;
            const path = objectValue.path + "." + propertyValue;
            _.pull(paths, objectValue.path);
            paths.push(path);
            return {
                code: function(cmp, fn) {
                    return getFromCmp(path, cmp, contextCmp);
                },
                path,
            };
        }
    };

    // evaluateCallExpression :: (Node, [String], Component) -> Result
    const evaluateCallExpression = (node, paths, contextCmp) => {
        const args = node.arguments;
        const callee = node.callee;
        const calleeValue = evaluate(callee, paths, contextCmp);
        const argsValue = _.map(args, arg => {
            return evaluate(arg, paths, contextCmp);
        });
        if(calleeValue) {
            return {
                code: function(cmp, fn) {
                    const func = calleeValue.code(cmp, fn);
                    if(!_.isFunction(func)) {
                        throw new Error("Invalid function: " + func);
                    }
                    return func.apply(null, _.map(argsValue, arg => arg.code(cmp, fn)));
                },
                path: calleeValue.path + "(" + _.map(argsValue, "path").join(", ") + ")",
            };
        }
        else {
            throw new Error("Cannot find function for " + callee);
        }
    };

    // evaluateLogicalExpression :: (Node, [String], Component) -> Result
    const evaluateLogicalExpression = (node, paths, contextCmp) => {
        const operator = node.operator;
        const left = evaluate(node.left, paths, contextCmp);
        const right = evaluate(node.right, paths, contextCmp);
        return {
            code: function(cmp, fn) {
                switch(operator) {
                    case '&&':
                        return left.code(cmp, fn) && right.code(cmp, fn);
                    case '||':
                        return left.code(cmp, fn) || right.code(cmp, fn);
                    default:
                        throw new Error("Unsupported logical expression: " + operator);
                }
            },
            path: left.path + " " + operator + " " + right.path,
        };
    };

    // evaluateUnaryExpression :: (Node, [String], Component) -> Result
    const evaluateUnaryExpression = (node, paths, contextCmp) => {
        const operator = node.operator;
        const argument = evaluate(node.argument, paths, contextCmp);
        return {
            code: function(cmp, fn) {
                switch(operator) {
                    case '-':
                        return -argument.code(cmp, fn);
                    case '!':
                        return !argument.code(cmp, fn);
                    default:
                        throw new Error("Unsupported unary expression: " + operator);
                }
            },
            path: operator + argument.path,
        };
    };

    // evaluateBinaryExpression :: (Node, [String], Component) -> Result
    const evaluateBinaryExpression = (node, paths, contextCmp) => {
        const operator = node.operator;
        const left = evaluate(node.left, paths, contextCmp);
        const right = evaluate(node.right, paths, contextCmp);
        return {
            code: function(cmp, fn) {
                switch(operator) {
                    case '+':
                        return fn.add(left.code(cmp, fn), right.code(cmp, fn));
                    case '-':
                        return left.code(cmp, fn) - right.code(cmp, fn);
                    case '*':
                        return left.code(cmp, fn) * right.code(cmp, fn);
                    case '/':
                        return left.code(cmp, fn) / right.code(cmp, fn);
                    case '%':
                        return left.code(cmp, fn) % right.code(cmp, fn);
                    case '==':
                        return fn.eq(left.code(cmp, fn), right.code(cmp, fn));
                    case '!=':
                        return fn.ne(left.code(cmp, fn), right.code(cmp, fn));
                    case '<':
                        return left.code(cmp, fn) < right.code(cmp, fn);
                    case '>':
                        return left.code(cmp, fn) > right.code(cmp, fn);
                    case '<=':
                        return left.code(cmp, fn) <= right.code(cmp, fn);
                    case '>=':
                        return left.code(cmp, fn) >= right.code(cmp, fn);
                    default:
                        throw new Error("Unsupported binary expression: " + operator);
                }
            },
            path: left.path + " " + operator + " " + right.path,
        };
    };

    // evaluateConditionalExpression :: (Node, [String], Component) -> Result
    const evaluateConditionalExpression = (node, paths, contextCmp) => {
        const test = evaluate(node.test, paths, contextCmp);
        const consequent = evaluate(node.consequent, paths, contextCmp);
        const alternate = evaluate(node.alternate, paths, contextCmp);
        return {
            code: function(cmp, fn) {
                return test.code(cmp, fn) ? consequent.code(cmp, fn) : alternate.code(cmp, fn);
            },
            path: test.path + " ? " + consequent.path + " : " + alternate.path,
        };
    };

    // evaluateArrayExpression :: (Node, [String], Component) -> Result
    const evaluateArrayExpression = (node, paths, contextCmp) => {
        const elements = _.map(node.elements, function(element) {
            return evaluate(element, paths, contextCmp);
        });
        return {
            code: function(cmp, fn) {
                return _.map(elements, element => element.code(cmp, fn));
            },
            path: '[' + _.map(elements, "path").join(", ") + ']',
        };
    };

    // evaluateCompoundExpression :: (Node, [String], Component) -> Result
    const evaluateCompoundExpression = (node, paths, contextCmp) => {
        throw new Error("Compound expression is not supported");
    };

    // evaluate :: (Node, [String], Component) -> Result
    const evaluate = (node, paths, contextCmp) => {
        switch(node.type) {
            case 'Literal':
                return evaluateLiteral(node, paths, contextCmp);
            case 'ThisExpression':
                return evaluateThis(node, paths, contextCmp);
            case 'Identifier':
                return evaluateIdentifier(node, paths, contextCmp);
            case 'MemberExpression':
                return evaluateMemberExpression(node, paths, contextCmp);
            case 'CallExpression':
                return evaluateCallExpression(node, paths, contextCmp);
            case 'LogicalExpression':
                return evaluateLogicalExpression(node, paths, contextCmp);
            case 'UnaryExpression':
                return evaluateUnaryExpression(node, paths, contextCmp);
            case 'BinaryExpression':
                return evaluateBinaryExpression(node, paths, contextCmp);
            case 'ConditionalExpression':
                return evaluateConditionalExpression(node, paths, contextCmp);
            case 'ArrayExpression':
                return evaluateArrayExpression(node, paths, contextCmp);
            case 'Compound':
                return evaluateCompoundExpression(node, paths, contextCmp);
            default:
                throw new Error("Unsupported node type: " + node.type);
        }
    };

    class JSepParser {
        constructor() {
        }

        parse(expression, contextCmp) {
            const parsed = window.$Script.parse(expression);
            const paths = [];
            const data = evaluate(parsed, paths, contextCmp);
            return [data.code, ...paths];
        }
    }

    window.$Parser.addParser('jsep', new JSepParser());
})(window);
