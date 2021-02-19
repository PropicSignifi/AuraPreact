import { h, render, Component } from 'preact';
import Preactlet from '../preactlet/preactlet';
import Utils from './utils';

const SELECTOR_PATTERN = '^([a-zA-Z0-9_]*(\\[[^\\]]+\\])?)( [a-zA-Z0-9_]*(\\[[^\\]]+\\])?)*$';
const SECTION_PATTERN = '^([a-zA-Z0-9_]*)(\\[([a-zA-Z0-9_]+)(([=])("([^"]*)"))?\\])?$';
const parser = new DOMParser();

const buildMatcher = section => {
    const p = new RegExp(SECTION_PATTERN);
    const result = p.exec(section);
    if(!result) {
        throw new Error(`Invalid query section: ${section}`);
    }
    const [,tagName,,attrName,,operator,,value] = result;
    return {
        tagName,
        attrName,
        operator,
        value,
    };
};

const getTagName = vnode => {
    let tagName = '';
    const nodeName = vnode.nodeName;
    if(_.isString(nodeName)) {
        tagName = nodeName;
    }
    else if(_.isFunction(nodeName)) {
        tagName = nodeName.displayName;
    }

    return tagName || '';
};

const matches = (matcher, vnode) => {
    let matched = true;

    if(matcher.tagName) {
        matched = (_.toLower(matcher.tagName) === _.toLower(getTagName(vnode)));
    }

    if(matched && matcher.attrName) {
        matched = _.has(vnode.attributes, matcher.attrName);
    }

    if(matched && matcher.operator) {
        switch(matcher.operator) {
            case '=':
                matched = (_.toString(matcher.value) === _.toString(vnode.attributes[matcher.attrName]));
                break;
            default:
                break;
        }
    }

    return matched;
};

const isVNode = target => !!_.get(target, 'nodeName');

const isQuery = target => target instanceof Query;

const isPreactlet = target => _.isPlainObject(target) && target.view;

const toVNode = node => {
    if(node.nodeType === 3) {
        return node.textContent;
    }

    const attrs = {};
    _.forEach(node.getAttributeNames(), attrName => {
        const attrValue = node.getAttribute(attrName);
        attrs[attrName] = attrValue;
    });

    const children = _.map(node.childNodes, toVNode);

    const name = node.tagName;
    const comp = name.substring(0, 1) === _.toUpper(name.substring(0, 1)) ? Preactlet.getRenderingComponent(name) : name;

    return h(comp, attrs, children);
};

const parseMarkup = markup => {
    const doc = parser.parseFromString(markup, 'text/xml');
    return toVNode(doc.childNodes[0]);
};

const vQuery = (vnode, selector) => {
    if(selector) {
        const p = new RegExp(SELECTOR_PATTERN);
        const result = p.exec(selector);
        if(!result) {
            throw new Error(`Invalid query selector: ${selector}`);
        }
        const subSelector = result[1];
        const matcher = buildMatcher(subSelector);

        const stack = isQuery(vnode) ? _.clone(vnode.get()) : new Query([vnode]).get();
        const found = [];
        while(!_.isEmpty(stack)) {
            const node = stack.shift();
            if(matches(matcher, node)) {
                found.push(node);
            }
            else {
                stack.push(...(node.children || []));
            }
        }

        let q = new Query(found);

        if(_.size(selector) > _.size(subSelector)) {
            q = q.find(_.trim(selector.substring(_.size(subSelector))));
        }

        return q;
    }
    else if(isQuery(vnode)) {
        return vnode;
    }
    else if(isVNode(vnode)) {
        return new Query([vnode]);
    }
    else if(isPreactlet(vnode)) {
        const rendered = Preactlet.render(vnode);
        return new Query([rendered]);
    }
    else if(_.isString(vnode)) {
        const rendered = parseMarkup(vnode);
        return new Query([rendered]);
    }
};

export default vQuery;

const formatVNodeAttribute = (key, value) => {
    if(_.isPlainObject(value)) {
        return `${key}={ {...} }`;
    }
    else if(_.isArray(value)) {
        return `${key}={ [...] }`;
    }
    else if(_.isFunction(value)) {
        return `${key}={ f }`;
    }
    else if(isVNode(value)) {
        return `${key}={ Component }`;
    }
    else {
        return `${key}="${_.toString(value)}"`;
    }
};

const formatVNode = (vnode, indent = 0) => {
    const indentation = _.repeat('    ', indent);
    if(_.isString(vnode)) {
        return [`${indentation}${vnode}`];
    }
    else if(_.isFunction(vnode.nodeName) && !vnode.nodeName.displayName) {
        return [`${indentation}{ f() }`];
    }
    else {
        const tagName = _.isString(vnode.nodeName) ? vnode.nodeName : vnode.nodeName.displayName;
        const attrs = _.chain(vnode.attributes).toPairs().map(([key, value]) => formatVNodeAttribute(key, value)).join(' ').value();
        const openTag = `${indentation}<${tagName}${attrs ? ' ' + attrs : ''}>`;
        const closeTag = `${indentation}</${tagName}>`;
        const lines = [];
        lines.push(openTag);
        _.forEach(vnode.children, child => {
            const childLines = formatVNode(child, indent + 1);
            lines.push(...(childLines || []));
        });
        lines.push(closeTag);

        return lines;
    }
};

const flattenVNode = vnode => {
    if(_.isString(vnode)) {
        return vnode;
    }
    else if(_.isFunction(vnode.nodeName) && !vnode.nodeName.displayName) {
        try {
            return vnode.nodeName(vnode.attributes);
        }
        catch(e) {
            return vnode;
        }
    }
    else {
        return vnode;
    }
};

const flatten = vnode => {
    const flattened = flattenVNode(vnode);
    if(flattened.children) {
        flattened.children = _.map(flattened.children, child => {
            const flattenedChild = flatten(child);
            if(!_.isString(flattenedChild)) {
                flattenedChild.$parent = flattened;
            }
            return flattenedChild;
        });
    }
    return flattened;
};

const setParent = (nodes, parent) => {
    _.forEach(nodes, node => node.$parent = parent);
};

const buildNewNodes = (v$, parent) => {
    const copy = v$.clone();
    const newNodes = copy.get();
    setParent(newNodes, parent);

    return newNodes;
};

const getParents = vnode => {
    const parents = [];
    let parent = vnode.$parent;
    while(parent) {
        parents.push(parent);

        parent = parent.$parent;
    }

    return parents;
};

class Query {
    constructor(vnodes) {
        this.vnodes = vnodes;

        this.flatten();
    }

    // ==================================   Utility   ==============================

    clone() {
        return new Query(_.cloneDeep(this.vnodes));
    }

    flatten() {
        this.vnodes = _.map(this.vnodes, flatten);

        return this;
    }

    debug(async = false) {
        const pretty = _.chain(this.vnodes)
            .flatMap(formatVNode)
            .join('\n')
            .value();

        if(async) {
            Utils.delay(() => {
                console.log(pretty);
            }, 0);
        }
        else {
            console.log(pretty);
        }

        return this;
    }

    get() {
        return this.vnodes;
    }

    toArray() {
        return this.get();
    }

    getFirst() {
        return _.first(this.vnodes);
    }

    add(vnode) {
        const v$ = vQuery(vnode);
        this.vnodes = [
            ...(this.vnodes),
            ...(v$.get())
        ];

        return this;
    }

    // ==================================   Traverse  ==============================

    find(selector) {
        return new Query(
            _.chain(this.vnodes)
            .flatMap(vnode => vQuery(vnode, selector).get())
            .value()
        );
    }

    parent(subSelector) {
        const matcher = subSelector && buildMatcher(subSelector);

        this.vnodes = _.chain(this.vnodes)
            .map(vnode => vnode.$parent)
            .filter(vnode => matcher ? matches(matcher, vnode) : true)
            .compact()
            .uniq()
            .value();

        return this;
    }

    parents(subSelector) {
        const matcher = subSelector && buildMatcher(subSelector);

        this.vnodes = _.chain(this.vnodes)
            .flatMap(getParents)
            .filter(vnode => matcher ? matches(matcher, vnode) : true)
            .compact()
            .uniq()
            .value();

        return this;
    }

    closest(subSelector) {
        const matcher = subSelector && buildMatcher(subSelector);

        this.vnodes = _.chain(this.vnodes)
            .map(vnode => {
                let parent = vnode.$parent;

                while(parent) {
                    const result = matcher ? matches(matcher, parent) : true;
                    if(result) {
                        return parent;
                    }

                    parent = parent.$parent;
                }
            })
            .compact()
            .uniq()
            .value();

        return this;
    }

    children(subSelector) {
        const matcher = subSelector && buildMatcher(subSelector);

        this.vnodes = _.chain(this.vnodes)
            .flatMap(vnode => vnode.children)
            .filter(vnode => matcher ? matches(matcher, vnode) : true)
            .value();

        return this;
    }

    forEach(iterator) {
        if(_.isFunction(iterator)) {
            _.forEach(this.vnodes, vnode => {
                iterator.apply(vQuery(vnode), vnode);
            });
        }

        return this;
    }

    each(iterator) {
        return this.forEach(iterator);
    }

    map(fn) {
        if(_.isFunction(fn)) {
            this.vnodes = _.map(this.vnodes, fn);
        }

        return this;
    }

    filter(fn) {
        if(_.isFunction(fn)) {
            this.vnodes = _.filter(this.vnodes, fn);
        }

        return this;
    }

    eq(index) {
        this.vnodes = [_.nth(this.vnodes, index)];

        return this;
    }

    first() {
        this.vnodes = [_.first(this.vnodes)];

        return this;
    }

    last() {
        this.vnodes = [_.last(this.vnodes)];

        return this;
    }

    has(selector) {
        this.vnodes = _.filter(this.vnodes, vnode => {
            return vQuery(vnode, selector).size() > 0;
        });

        return this;
    }

    is(subSelector) {
        const matcher = buildMatcher(subSelector);

        this.vnodes = _.filter(this.vnodes, vnode => {
            return matches(matcher, vnode);
        });

        return this;
    }

    not(subSelector) {
        const matcher = buildMatcher(subSelector);

        this.vnodes = _.reject(this.vnodes, vnode => {
            return matches(matcher, vnode);
        });

        return this;
    }

    slice(start, end) {
        this.vnodes = _.slice(this.vnodes, start, end);

        return this;
    }

    // ==================================   Attribute ==============================

    attr(key, value) {
        if(_.isUndefined(value)) {
            const attrValues = _.map(this.vnodes, vnode => vnode.attributes[key]);
            return _.size(this.vnodes) === 1 ? _.first(attrValues) : attrValues;
        }
        else {
            _.forEach(this.vnodes, vnode => {
                vnode.attributes[key] = value;
            });

            return this;
        }
    }

    length() {
        return _.size(this.vnodes);
    }

    size() {
        return this.length();
    }

    // ==================================   Insert    ==============================

    append(vnode) {
        const v$ = vQuery(vnode);

        _.forEach(this.vnodes, vnode => {
            vnode.children.push(...(buildNewNodes(v$, vnode)));
        });

        return this;
    }

    prepend(vnode) {
        const v$ = vQuery(vnode);

        _.forEach(this.vnodes, vnode => {
            vnode.children.unshift(...(buildNewNodes(v$, vnode)));
        });

        return this;
    }

    markup(vnode) {
        const v$ = vQuery(vnode);

        _.forEach(this.vnodes, vnode => {
            vnode.children = buildNewNodes(v$, vnode);
        });

        return this;
    }

    before(vnode) {
        const v$ = vQuery(vnode);

        _.forEach(this.vnodes, vnode => {
            const $parent = vnode.$parent;
            if(!$parent) {
                return;
            }

            const index = _.indexOf($parent.children, vnode);
            $parent.children.splice(index, 0, ...(buildNewNodes(v$, $parent)));
        });

        return this;
    }

    after(vnode) {
        const v$ = vQuery(vnode);

        _.forEach(this.vnodes, vnode => {
            const $parent = vnode.$parent;
            if(!$parent) {
                return;
            }

            const index = _.indexOf($parent.children, vnode);
            $parent.children.splice(index + 1, 0, ...(buildNewNodes(v$, $parent)));
        });

        return this;
    }

    wrap(vnode) {
        const v$ = vQuery(vnode);

        _.forEach(this.vnodes, vnode => {
            const $parent = vnode.$parent;
            if(!$parent) {
                return;
            }

            const newNodes = buildNewNodes(v$, $parent);
            const newParent = newNodes[0];
            if(!newParent) {
                return;
            }

            vnode.$parent = newParent;
            newParent.children = [vnode];

            const index = _.indexOf($parent.children, vnode);
            newParent.$parent = $parent;
            $parent.children[index] = newParent;
        });

        return this;
    }

    unwrap() {
        _.forEach(this.vnodes, vnode => {
            const $parent = vnode.$parent;
            if(!$parent) {
                return;
            }

            const $grandparent = $parent.$parent;
            if(!$grandparent) {
                return;
            }

            const index = _.indexOf($grandparent.children, $parent);
            $grandparent.children[index] = vnode;
            vnode.$parent = $grandparent;
        });

        return this;
    }

    // ==================================   Update    ==============================

    replace(vnode) {
        const v$ = vQuery(vnode);

        _.forEach(this.vnodes, vnode => {
            const $parent = vnode.$parent;
            if(!$parent) {
                return;
            }

            const index = _.indexOf($parent.children, vnode);
            $parent.children.splice(index, 1, ...(buildNewNodes(v$, $parent)));
        });

        return this;
    }

    // ==================================   Remove    ==============================

    empty() {
        _.forEach(this.vnodes, vnode => {
            vnode.children = [];
        });

        return this;
    }

    remove() {
        _.forEach(this.vnodes, vnode => {
            const $parent = vnode.$parent;
            if(!$parent) {
                return;
            }

            const index = _.indexOf($parent.children, vnode);
            $parent.children.splice(index, 1);
            vnode.$parent = undefined;
        });

        return this;
    }

    detach() {
        return this.remove();
    }

    // ==================================   Classes   ==============================

    addClass(classnames) {
        _.forEach(this.vnodes, vnode => {
            const oldClassnames = _.split(vnode.attributes.className, ' ');
            const newClassnames = _.split(classnames, ' ');
            vnode.attributes.className = _.chain(oldClassnames)
                .union(newClassnames)
                .join(' ')
                .value();
        });

        return this;
    }

    removeClass(classnames) {
        _.forEach(this.vnodes, vnode => {
            const oldClassnames = _.split(vnode.attributes.className, ' ');
            const newClassnames = _.split(classnames, ' ');
            vnode.attributes.className = _.chain(oldClassnames)
                .difference(newClassnames)
                .join(' ')
                .value();
        });

        return this;
    }

    hasClass(classnames) {
        return _.some(this.vnodes, vnode => {
            const oldClassnames = _.split(vnode.attributes.className, ' ');
            const newClassnames = _.split(classnames, ' ');
            const commonClassnames = _.intersection(oldClassnames, newClassnames);
            return !_.isEmpty(commonClassnames);
        });
    }

    toggleClass(classnames) {
        _.forEach(this.vnodes, vnode => {
            const oldClassnames = _.split(vnode.attributes.className, ' ');
            const newClassnames = _.split(classnames, ' ');
            vnode.attributes.className = _.chain(oldClassnames)
                .xor(newClassnames)
                .join(' ')
                .value();
        });

        return this;
    }
}
