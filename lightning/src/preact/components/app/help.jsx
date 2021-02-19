import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import Modal from '../modal/modal';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import Input from '../input/input';
import TableManager from '../table/TableManager';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Markdown from '../markdown/markdown';
import { PrimitiveIcon } from '../icon/icon';
import Button from '../button/button';
import Utils from '../utils/utils';
import Actions from '../utils/actions';
import { createPopover } from '../popover/popover';
import styles from './help.less';

const helpItemColumns = [
    {
        name: 'name',
        header: 'Name',
    },
];

const RECORD_PAGE_PATTERN = /^\/lightning\/r\/([^\/]+).*/g;
const OTHER_PAGE_PATTERN = /^\/lightning\/o\/([^\/]+).*/g;
const MAIN_PAGE_PATTERN = /^\/lightning\/page\/([^\/]+).*/g;
const TAB_PAGE_PATTERN = /^\/lightning\/n\/([^\/]+).*/g;
const CMP_PAGE_PATTERN = /^\/lightning\/cmp\/([^\/]+).*/g;

// Usage in markdown like:
// $ABC|Help|a b c$
const CUSTOM_HELP_MARKDOWN_PATTERN = /\$([^|]+)\|([^|]+)\|([^$]+)\$/g;

const extractHelpKey = input => {
    if(RECORD_PAGE_PATTERN.test(input)) {
        return input.replace(RECORD_PAGE_PATTERN, '$1');
    }
    else if(OTHER_PAGE_PATTERN.test(input)) {
        return input.replace(OTHER_PAGE_PATTERN, '$1');
    }
    else if(MAIN_PAGE_PATTERN.test(input)) {
        return input.replace(MAIN_PAGE_PATTERN, '$1');
    }
    else if(TAB_PAGE_PATTERN.test(input)) {
        return input.replace(TAB_PAGE_PATTERN, '$1');
    }
    else if(CMP_PAGE_PATTERN.test(input)) {
        return input.replace(CMP_PAGE_PATTERN, '$1');
    }
    else {
        return input;
    }
};

export function beforeMarkdownRender(md) {
    return md && md.replace(CUSTOM_HELP_MARKDOWN_PATTERN, '<a data-key="$2" data-value="$3">$1</a>');
}

const processGuideData = guide => {
    const content = guide.Content__c;
    const lines = _.split(content, '\n');

    const result = [];
    let buffer = [];
    let anchor = null;
    _.forEach(lines, line => {
        line = _.trim(line);
        if(_.startsWith(line, '[') && _.endsWith(line, ']')) {
            if(anchor) {
                result.push({
                    anchor,
                    content: _.join(buffer, '\n'),
                });
                buffer = [];
            }

            anchor = _.trim(line, '[]');
        }
        else {
            buffer.push(line);
        }
    });

    if(anchor) {
        result.push({
            anchor,
            content: _.join(buffer, '\n'),
        });
    }

    return result;
};

export default class Help extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            showHelp: false,
            searchHelpText: null,
            searchHelpLoading: false,
            helpItems: [],
            selectedHelpItem: null,
            showGuide: false,
            guides: [],
            selectedGuide: null,
            selectedGuideIndex: null,
            showGuideAlignment: 'left',
            popoverStyle: {
            },
        });

        this.bind([
            'onCancelHelp',
            'onSearchHelpTextChange',
            'createHelpItemEditor',
            'goToSearchHelp',
            'afterMarkdownRender',
            'onCloseGuide',
            'onCancelShowGuide',
            'renderGuideContent',
            'createGuideHeader',
            'createGuideFooter',
            'onNextGuideStep',
        ]);
    }

    componentDidMount() {
        super.componentDidMount();

        Actions.registerAction('Help', () => {
            this.setState({
                showHelp: true,
                searchHelpLoading: true,
            });

            let key = extractHelpKey(window.location.pathname);
            const prefix = Utils.getNamespacePrefix();
            if(_.startsWith(key, prefix)) {
                key = key.substring(_.size(prefix));
            }
            if(_.startsWith(key, 'c__')) {
                key = key.substring(3);
            }
            window.$ActionService.DataLightningExtension.invoke('loadHelp', {
                key,
            }).then(data => {
                if(data) {
                    this.setState({
                        searchHelpLoading: false,
                        selectedHelpItem: data,
                    });
                }
                else {
                    this.setState({
                        searchHelpLoading: false,
                    });
                }
            });
        });

        Actions.registerAction('Guide', () => {
            this.setState({
                showGuide: true,
            });
        });
    }

    createHelpItemEditor(item) {
        return (
            <a
                href="javascript:void(0);"
                className="slds-box slds-box_link slds-box_x-small slds-media slds-m-top_x-small"
                onClick={ () => this.onSelectHelpItem(item) }
            >
                <div className="slds-media__figure slds-media__figure_fixed-width slds-align_absolute-center slds-m-left_xx-small">
                    <span className="slds-icon_container slds-icon-utility-knowledge_base">
                        <PrimitiveIcon
                            variant="bare"
                            iconName="utility:knowledge_base"
                            className="slds-icon slds-icon-text-default"
                        >
                        </PrimitiveIcon>
                    </span>
                </div>
                <div className="slds-media__body slds-border_left slds-p-around_small">
                    <h2 className="slds-truncate slds-text-heading_small">{ item.Title__c }</h2>
                    {
                        item.Type__c !== 'Guide' && (
                        <p className={ `slds-m-top_small ${styles.previewText}` }>
                            {
                                this.createHelpMarkdown(item.Content__c)
                            }
                        </p>
                        )
                    }
                </div>
            </a>
        );
    }

    onSelectHelpItem(item) {
        this.setState({
            searchHelpLoading: true,
        });

        const args = {};
        if(item.Id) {
            args.id = item.Id;
        }
        else if(_.isString(item)) {
            args.title = item;
        }

        window.$ActionService.DataLightningExtension.invoke('loadHelp', args).then(data => {
            if(data.Type__c === 'Guide') {
                data.guides = processGuideData(data);
                this.setState({
                    searchHelpLoading: false,
                    selectedGuide: data,
                    selectedGuideIndex: 0,
                    showGuide: false,
                }, () => {
                    this.openGuide();
                });
            }
            else {
                this.setState({
                    searchHelpLoading: false,
                    selectedHelpItem: data,
                });
            }
        });
    }

    onNextGuideStep() {
        let index = this.state.selectedGuideIndex;
        index += 1;
        if(index >= _.size(this.state.selectedGuide.guides)) {
            index = _.size(this.state.selectedGuide.guides);
        }

        this.setState({
            selectedGuideIndex: index,
        }, () => {
            this.openGuide();
        });
    }

    getCurrentGuideStep() {
        const guide = this.state.selectedGuide.guides[this.state.selectedGuideIndex];
        return guide;
    }

    renderGuideContent() {
        const guide = this.getCurrentGuideStep();
        return this.createHelpMarkdown(guide.content);
    }

    createGuideHeader() {
        return (
        <header className="slds-popover__header slds-p-vertical_medium">
            <h2 className="slds-text-heading_medium">{ this.state.selectedGuide.Title__c }</h2>
        </header>
        );
    }

    createGuideFooter() {
        return (
        <footer className="slds-popover__footer">
            <div className="slds-grid slds-grid_vertical-align-center">
                <span className="slds-text-title">{ `Step ${this.state.selectedGuideIndex + 1} of ${_.size(this.state.selectedGuide.guides)}` }</span>
                {
                    this.state.selectedGuideIndex < _.size(this.state.selectedGuide.guides) - 1 && (
                        <Button
                            className="slds-col_bump-left"
                            label="Next"
                            variant="brand"
                            onClick={ this.onNextGuideStep }
                        >
                        </Button>
                    )
                }
            </div>
        </footer>
        );
    }

    onCancelShowGuide() {
        this.setState({
            showGuide: false,
        });
    }

    onCloseGuide() {
        this.setState({
            selectedGuide: null,
        });
    }

    openGuide() {
        const guide = this.getCurrentGuideStep();
        const anchorName = guide.anchor;
        const node = _.find(document.querySelectorAll(`[data-anchor="${anchorName}"`), n => {
            return window.getComputedStyle(n).display !== 'none';
        });
        if(!node) {
            return;
        }
        const pos = window.$Utils.getPositionFromBody(node);
        const rect = node.getBoundingClientRect();
        const popoverStyle = {
            position: 'absolute',
            left: pos.left + (rect.width / 2) + 'px',
            top: pos.top + (rect.height / 2) + 'px',
        };
        const alignment = (pos.right + (rect.width / 2)) < 250 ? 'right' : 'left';

        this.setState({
            showGuideAlignment: alignment,
            popoverStyle,
        });
    }

    onSearchHelpTextChange(newVal) {
        this.setState({
            searchHelpText: newVal,
            searchHelpLoading: true,
        });

        if(newVal && _.size(newVal) >= 2) {
            window.$ActionService.DataLightningExtension.invoke('searchHelp', {
                searchText: newVal,
            }).then(data => {
                const [ guides, helpItems, ] = _.partition(data, item => item.Type__c === 'Guide');

                this.setState({
                    searchHelpLoading: false,
                    helpItems,
                    guides,
                });
            });
        }
        else {
            this.setState({
                searchHelpLoading: false,
                helpItems: [],
                guides: [],
            });
        }
    }

    createHelpFooter() {
        return (
            <div>
                <Button
                    label="Cancel"
                    variant="tertiary"
                    onClick={ this.onCancelHelp }
                >
                </Button>
            </div>
        );
    }

    onCancelHelp() {
        this.setState({
            showHelp: false,
        });
    }

    goToSearchHelp() {
        this.setState({
            selectedHelpItem: null,
        });
    }

    afterMarkdownRender(container) {
        const anchors = container.getElementsByTagName('a');
        _.forEach(anchors, anchor => {
            if(anchor.hasAttribute('data-key') && !anchor.hasAttribute('data-bound')) {
                const key = anchor.getAttribute('data-key');
                const value = anchor.getAttribute('data-value');
                anchor.addEventListener('click', e => {
                    if(key === 'Help') {
                        this.onSelectHelpItem(value);
                    }
                    else if(key === 'Action') {
                        Actions.invokeAction(value);
                    }
                    else {
                        // ignored
                    }
                });

                anchor.setAttribute('data-bound', true);
            }
        });
    }

    createHelpMarkdown(content) {
        return (
            <Markdown
                beforeMarkdownRender={ beforeMarkdownRender }
                afterMarkdownRender={ this.afterMarkdownRender }
            >
                { content }
            </Markdown>
        );
    }

    render(props, state) {
        return (
            <div data-type={ this.getTypeName() }>
                <Modal
                    visible={ this.state.showHelp }
                    onClose={ this.onCancelHelp }
                    header="Help"
                    loading={ this.state.searchHelpLoading }
                    size="large"
                >
                    <div className={ this.state.selectedHelpItem ? 'slds-hide' : '' }>
                        <FormGroup>
                            <FormTile>
                                <Input
                                    name="searchText"
                                    label="Search Text"
                                    variant="label-removed"
                                    type="search"
                                    placeholder="Type something to search"
                                    autocomplete="off"
                                    value={ this.state.searchHelpText }
                                    onValueChange={ this.onSearchHelpTextChange }
                                >
                                </Input>
                            </FormTile>
                        </FormGroup>
                        <TableManager
                            className="slds-m-top_small"
                            name="system_helpTable"
                            header="Help Items"
                            headerVisible="false"
                            data={ this.state.helpItems }
                            columns={ helpItemColumns }
                            pageSize="5"
                            modes={ ['List'] }
                            mode="List"
                            createListItemEditor={ this.createHelpItemEditor }
                        >
                        </TableManager>
                    </div>
                    <div className={ this.state.selectedHelpItem ? '' : 'slds-hide' }>
                        <div className="slds-grid slds-m-bottom_small">
                            <nav role="navigation" aria-label="Breadcrumbs">
                                <ol className="slds-breadcrumb slds-list_horizontal slds-wrap">
                                    {
                                        _.map(_.reverse(_.get(this.state.selectedHelpItem, 'Parents')), item => {
                                            return (
                                            <li className="slds-breadcrumb__item">
                                                <a href="javascript:void(0);" onClick={ () => this.onSelectHelpItem(item) }>{ item.Title__c }</a>
                                            </li>
                                            );
                                        })
                                    }
                                </ol>
                            </nav>
                            <ButtonIcon
                                className="slds-col_bump-left"
                                iconName="ctc-utility:a_search"
                                variant="bare"
                                size="large"
                                onClick={ this.goToSearchHelp }
                                alternativeText="Search">
                            </ButtonIcon>
                        </div>
                        <div className="slds-text-heading_large slds-border_bottom slds-m-bottom_small">
                            { _.get(this.state.selectedHelpItem, 'Title__c') }
                        </div>
                        {
                            this.createHelpMarkdown(_.get(this.state.selectedHelpItem, 'Content__c'))
                        }
                        {
                            !_.isEmpty(_.get(this.state.selectedHelpItem, 'CRM_Helps__r')) && (
                            <div className="slds-border_top slds-m-top_small slds-p-top_small">
                                <div className="slds-tet-heading_small">
                                    Related:
                                </div>
                                <ul>
                                    {
                                        _.map(_.reject(this.state.selectedHelpItem.CRM_Helps__r, item => item.Type__c === 'Guide'), item => {
                                            return (
                                            <li>
                                                <a onClick={ () => this.onSelectHelpItem(item) }>
                                                    { item.Title__c }
                                                </a>
                                            </li>
                                            );
                                        })
                                    }
                                </ul>
                            </div>
                            )
                        }
                    </div>
                </Modal>
                <Modal
                    visible={ this.state.showGuide }
                    onClose={ this.onCancelShowGuide }
                    header="Guide"
                    loading={ this.state.searchHelpLoading }
                >
                    <div className={ this.state.selectedGuide ? 'slds-hide' : '' }>
                        <FormGroup>
                            <FormTile>
                                <Input
                                    name="searchText"
                                    label="Search Text"
                                    variant="label-removed"
                                    type="search"
                                    placeholder="Type something to search"
                                    autocomplete="off"
                                    value={ this.state.searchHelpText }
                                    onValueChange={ this.onSearchHelpTextChange }
                                >
                                </Input>
                            </FormTile>
                        </FormGroup>
                        <TableManager
                            className="slds-m-top_small"
                            name="system_guideTable"
                            header="Guides"
                            headerVisible="false"
                            data={ this.state.guides }
                            columns={ helpItemColumns }
                            pageSize="5"
                            modes={ ['List'] }
                            mode="List"
                            createListItemEditor={ this.createHelpItemEditor }
                        >
                        </TableManager>
                    </div>
                </Modal>
                {
                    this.state.selectedGuide && createPopover({
                        alignment: this.state.showGuideAlignment,
                        width: 'small',
                        variant: 'walkthrough',
                        prompted: !!this.state.selectedGuide,
                        label: 'Guide',
                        id: `guide_${_.uniqueId()}`,
                        popupStyle: this.state.popoverStyle,
                        onClose: this.onCloseGuide,
                        createHeader: this.createGuideHeader,
                        createFooter: this.createGuideFooter,
                        renderContent: this.renderGuideContent,
                        withOverlay: true,
                    })
                }
            </div>
        );
    }
}
