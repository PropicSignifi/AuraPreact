(function(window) {
    const $LIGHTNING_EXPRESSION_SYNTAX = `
    {
        var args = [];

        function addArg(arg) {
            args.push(arg);
        }

        function getArgs() {
            return args;
        }
    }

    start
        = result:expression {
            return [result].concat(getArgs());
        }

    whitespace
        = [ ]*

    grouped_expression
        = "(" matched_grouped_expression:expression ")" {
            return function(cmp, fn) {
                return matched_grouped_expression(cmp, fn);
            };
        }

    expression
        = function_expression
        / conditional_expression
        / simple_expression

    conditional_expression
        = match1:simple_expression whitespace "?" whitespace match2:simple_expression whitespace ":" whitespace match3:simple_expression {
            return function(cmp, fn) {
                return match1(cmp, fn) ? match2(cmp, fn) : match3(cmp, fn);
            };
        }

    simple_expression
        = head:term tail:(whitespace ("+"/"-"/"*"/"/"/"%"/"=="/"eq"/"!="/"ne"/"<="/"le"/">="/"ge"/"<"/"lt"/">"/"gt"/"&&"/"||") whitespace term)* {
            return function(cmp, fn) {
                var result = head(cmp, fn);
                return _.reduce(tail, function(prev, item) {
                    var operator = item[1];
                    var operand = item[3](cmp, fn);
                    switch(operator) {
                        case '+':
                            return fn.add(prev, operand);
                        case '-':
                            return prev - operand;
                        case '*':
                            return prev * operand;
                        case '/':
                            return prev / operand;
                        case '%':
                            return prev % operand;
                        case '==':
                            return fn.eq(prev, operand);
                        case 'eq':
                            return fn.eq(prev, operand);
                        case '!=':
                            return fn.ne(prev, operand);
                        case 'ne':
                            return fn.ne(prev, operand);
                        case '<':
                            return prev < operand;
                        case 'lt':
                            return prev < operand;
                        case '>':
                            return prev > operand;
                        case 'gt':
                            return prev > operand;
                        case '<=':
                            return prev <= operand;
                        case 'le':
                            return prev <= operand;
                        case '>=':
                            return prev >= operand;
                        case 'ge':
                            return prev >= operand;
                        case '&&':
                            return prev && operand;
                        case '||':
                            return prev || operand;
                        default:
                            throw new Error("Invalid operator: " + operator);
                    }
                }, result);
            };
        }

    function_name
        = matched_function_name:[a-zA-Z]+ {
            return function(cmp, fn) {
                return matched_function_name.join("");
            };
        }

    function_expression
        = func_name:function_name "(" first:expression other:(whitespace "," whitespace expression)* ")" {
            return function(cmp, fn) {
                var func = func_name(cmp, fn);
                var args = [first(cmp, fn)];
                _.each(other, function(item) {
                    args.push(item[3](cmp, fn));
                });
                var f = fn[func];
                if(_.isFunction(f)) {
                    return f.apply(null, args);
                }
                else {
                    throw new Error("Invalid function: " + func);
                }
            };
        }

    term
        = grouped_expression
        / unary_expression
        / variable

    unary_expression
        = negative_expression
        / not_expression

    negative_expression
        = "-" + matched_negative_expression:expression {
            return function(cmp, fn) {
                return -(matched_negative_expression(cmp, fn));
            };
        }

    not_expression
        = "!" + matched_not_expression:expression {
            return function(cmp, fn) {
                return !(matched_not_expression(cmp, fn));
            };
        }

    variable
        = literal
        / value

    value
        = matched_value:([$a-zA-Z][a-zA-Z0-9\.]+) {
            var path = _.flatten(matched_value).join("");
            addArg(path);
            return function(cmp, fn) {
                return cmp.get(path);
            };
        }

    literal
        = null
        / number
        / string
        / boolean

    boolean
        = matched_boolean:("true" / "false") {
            return function(cmp, fn) {
                return matched_boolean === "true";
            };
        }

    null
        = "null" {
            return function(cmp, fn) {
                return null;
            };
        }

    // Handles only non-negative numbers, excluding scientific floating numbers
    number
        = matched_number:([0-9]+(\.[0-9]+)?) {
            return function(cmp, fn) {
                if(matched_number[1] === null) {
                    return Number(matched_number[0].join(""));
                }
                else {
                    return Number(_.flatten(matched_number).join(""));
                }
            };
        }

    string
        = "'" matched_string:[^']* "'" {
            return function(cmp, fn) {
                return matched_string.join("");
            };
        }
    `;

    window.$LIGHTNING_EXPRESSION_SYNTAX = $LIGHTNING_EXPRESSION_SYNTAX;
})(window);
