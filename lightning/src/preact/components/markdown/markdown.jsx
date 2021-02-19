import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import showdown from 'showdown';

export default class Markdown extends BaseComponent {
    constructor() {
        super();

        this.$converter = new showdown.Converter({
            smoothLivePreview: true,
            openLinksInNewWindow: true,
            tables: true,
            strikethrough: true,
            tasklists: true,
            parseImgDimension: true,
        });

        this.$container = null;

        this.bind([
            'setNode',
        ]);
    }

    convertMarkdown(input) {
        return this.$converter.makeHtml(input);
    }

    setNode(node) {
        this.$container = node;
    }

    componentDidMount() {
        super.componentDidMount();
        this.afterMarkdownRender();
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        this.afterMarkdownRender();
    }

    afterMarkdownRender() {
        if(_.isFunction(this.prop('afterMarkdownRender'))) {
            this.prop('afterMarkdownRender')(this.$container);
        }
    }

    render(props, state) {
        const [{
            className,
            content,
            beforeMarkdownRender,
            children,
        }, rest] = this.getPropValues();

        let input = null;

        if(!_.isEmpty(children)) {
            input = _.toString(children);
        }

        if(content) {
            input = content;
        }

        let html = this.convertMarkdown(input);
        if(_.isFunction(beforeMarkdownRender)) {
            html = beforeMarkdownRender(html);
        }

        return (
            <div
                ref={ this.setNode }
                className={ `slds-markdown ${className}` }
                data-type={ this.getTypeName() }
                { ...rest }
                dangerouslySetInnerHTML={ { __html: html } }
            >
            </div>
        );
    }
}

Markdown.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    content: PropTypes.isString('content').demoValue(''),
    beforeMarkdownRender: PropTypes.isFunction('beforeMarkdownRender'),
    afterMarkdownRender: PropTypes.isFunction('afterMarkdownRender'),
    children: PropTypes.isChildren('children'),
};

Markdown.propTypesRest = true;
Markdown.displayName = "Markdown";
