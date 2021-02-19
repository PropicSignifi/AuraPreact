import Utils from '../utils/utils';

const parser = new DOMParser();

function evalInContext(js, context = {}) {
    return Utils.evalInContext(`
        function lt(a, b) {
            return a < b;
        }

        function lte(a, b) {
            return a <= b;
        }

        function gt(a, b) {
            return a > b;
        }

        function gte(a, b) {
            return a >= b;
        }

        function and() {
            return Array.prototype.slice.call(arguments).reduce(function(prev, item) {
                return prev && item;
            }, true);
        }

        function or() {
            return Array.prototype.slice.call(arguments).reduce(function(prev, item) {
                return prev || item;
            }, false);
        }

        function formatCurrency(amount, options) {
            options = options || {};
            var formattedCode = options.code || '$';
            var fixed = options.fixed || 0;
            var formattedAmount = new Number(amount).toFixed(fixed || 2).replace(/\\d(?=(\\d{3})+\\.)/g, '$&,');
            if (!fixed) {
                var pos = formattedAmount.lastIndexOf('.');
                formattedAmount = formattedAmount.substring(0, pos);
            }
            return formattedCode + formattedAmount;
        }

        function formatDatetime(datetime, format, timezone) {
            var m = window.moment(datetime);
            if (timezone) {
                m = m.tz(timezone);
            }
            return m.format(format);
        }
        ;${js}
        `, {
        '$Data': context,
    });
}

function renderNode(node, context, skipEval) {
    const attrs = [];
    for (let attrName of node.getAttributeNames()) {
        if(attrName.startsWith('data-')) {
            continue;
        }
        const attrValue = skipEval ? node.getAttribute(attrName) : evalText(node.getAttribute(attrName), context);
        attrs.push(`${attrName}="${attrValue}"`);
    }
    const tagName = node.tagName;
    const lines = [
        `<${tagName} ${attrs.join(' ')}>`,
    ];
    const children = [];
    let text = '';
    for (let child of node.childNodes) {
        if (child.nodeType === 3) {
            text += child.nodeValue;
        } else {
            children.push(skipEval ? text : evalText(text, context));
            text = '';
            const childCodes = toCode(child, context, skipEval);
            if (childCodes) {
                childCodes.forEach(childCode => {
                    children.push(childCode);
                });
            }
        }
    }
    if (text) {
        children.push(skipEval ? text : evalText(text, context));
    }
    lines.push(children.join('\n'));
    lines.push(`</${tagName}>`);
    return lines.join('\n');
}

function evalText(text = '', context = {}) {
    return text.replace(/\{!([^}]*)\}/gm, (match, group) => String(evalInContext(group, context)));
}

function toCode(node, context, skipEval) {
    if (!node || node.nodeType !== 1) {
        return [];
    }

    if (!skipEval && node.hasAttribute('data-if')) {
        const conditionalCode = node.getAttribute('data-if');
        const passed = evalInContext(conditionalCode, context);
        if (!passed) {
            return [];
        }
    }

    const result = [];
    if (!skipEval && node.hasAttribute('data-repeat')) {
        const repeatCode = node.getAttribute('data-repeat');
        let [varName, iterations] = repeatCode.split(' in ');
        if (!varName || !iterations) {
            throw new Error('Invalid looping code for ' + repeatCode);
        }
        varName = varName.trim();
        iterations = iterations.trim();
        const list = evalInContext(iterations, context) || [];
        for (let item of list) {
            const newContext = Object.assign({}, context, {
                [varName]: item
            });
            result.push(renderNode(node, newContext, skipEval));
        }
    } else {
        [node].forEach(node => {
            result.push(renderNode(node, context, skipEval));
        });
    }

    return result;
}

const mergeContext = (context, userContext) => {
    if(context.$User) {
        return context;
    }
    else {
        const newContext = {};
        userContext && userContext.forEach(item => {
            newContext[item.name] = item.value;
        });

        return Object.assign({}, context, {
            '$User': newContext
        });
    }
};

export const compile = (code = '', context = {}, userContext = {}) => {
    if (!code) {
        return code;
    }

    const allContext = mergeContext(context, userContext.variables);

    const doc = parser.parseFromString(code, "text/xml");
    return toCode(doc.children[0], allContext)[0];
};

export const splitSections = code => {
    const doc = parser.parseFromString(code, "text/xml");

    return _.chain(_.get(doc, 'children[0].children'))
        .map((node, index) => {
            return {
                name: node.getAttribute('data-name') || `Section ${index + 1}`,
                code: `<mj-container>${toCode(node, {}, true)}</mj-container>`,
            };
        })
        .value();
};
