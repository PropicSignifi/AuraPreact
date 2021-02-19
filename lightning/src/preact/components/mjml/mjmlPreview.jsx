import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { splitSections } from './mjmlUtils';
import MjmlView from './mjmlView';
import styles from './mjmlPreview.less';

export default class MjmlPreview extends BaseComponent {
    constructor() {
        super();

        this.state = {
            sections: [],
        };

        this._lastSrc = null;
    }

    componentDidMount() {
        super.componentDidMount();

        this.loadMjmlPreview(this.prop('src'));
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        this.loadMjmlPreview(nextProps.src);
    }

    loadMjmlPreview(src) {
        if(src !== this._lastSrc) {
            const sections = splitSections(src);

            this.setState({
                sections,
            });

            this._lastSrc = src;
        }
    }

    onSelectSection(section) {
        if(_.isFunction(this.prop('onSectionSelect'))) {
            const newSectionName = _.get(section, 'name');
            this.prop('onSectionSelect')(newSectionName === this.prop('activeSectionName') ? null : newSectionName);
        }
    }

    render(props, state) {
        const [{
            className,
            context,
            userContext,
            activeSectionName,
        }, rest] = this.getPropValues();

        return (
            <div
                className={ className }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                {
                    _.map(this.state.sections, section => {
                        return (
                            <div
                                className={ `${styles.section} ${section.name === activeSectionName ? styles.section_active : ''}` }
                                onclick={ () => this.onSelectSection(section) }
                            >
                                {
                                    section.name && (
                                    <div className={ styles.label }>
                                        { section.name }
                                    </div>
                                    )
                                }
                                <div className={ styles.overlay }>
                                </div>
                                <MjmlView
                                    src={ section.code }
                                    context={ context }
                                    userContext={ userContext }
                                >
                                </MjmlView>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

MjmlPreview.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    src: PropTypes.isString('src'),
    context: PropTypes.isObject('context'),
    userContext: PropTypes.isObject('userContext'),
    activeSectionName: PropTypes.isString('activeSectionName'),
    onSectionSelect: PropTypes.isFunction('onSectionSelect'),
};

MjmlPreview.propTypesRest = true;
MjmlPreview.displayName = "MjmlPreview";
