import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { compile } from './mjmlUtils';

const extractInnerHtml = html => {
    html = html.replace(/<body(.*)>/, '<body>');
    let start = html.indexOf('<body>') + 6;
    let end = html.indexOf('</body>');
    html = html.substring(start, end).trim();
    return html;
};

export default class MjmlView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            html: '',
        };

        this._lastSrc = null;
        this._lastContext = null;
        this._lastUserContext = null;
    }

    componentDidMount() {
        super.componentDidMount();

        this.loadMjmlView(this.prop('src'), this.prop('context'), this.prop('userContext'));
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        this.loadMjmlView(nextProps.src, nextProps.context, nextProps.userContext);
    }

    loadMjmlView(src, context, userContext) {
        if(_.isFunction(window.mjml2html) &&
            (this._lastSrc !== src ||
            !_.isEqual(this._lastContext, context) ||
            !_.isEqual(this._lastUserContext, userContext))
        ) {
            const fullSrc = `
            <mjml>
                <mj-body>
                    ${src}
                </mj-body>
            </mjml>
            `;
            const compiled = compile(fullSrc, _.assign({}, context, {
                '$User': userContext,
            }));
            const { errors, html } = window.mjml2html(compiled);

            if(!_.isEmpty(errors)) {
                console.error(errors);
            }
            else {
                this.setState({
                    html: extractInnerHtml(html),
                });
            }

            this._lastSrc = src;
            this._lastContext = context;
            this._lastUserContext = userContext;
        }
    }

    render(props, state) {
        const [{
            className,
        }, rest] = this.getPropValues();

        return (
            <div
                className={ className }
                data-type={ this.getTypeName() }
                dangerouslySetInnerHTML={ { __html: this.state.html } }
                { ...rest }
            >
            </div>
        );
    }
}

MjmlView.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    src: PropTypes.isString('src'),
    context: PropTypes.isObject('context'),
    userContext: PropTypes.isObject('userContext'),
};

MjmlView.propTypesRest = true;
MjmlView.displayName = "MjmlView";
