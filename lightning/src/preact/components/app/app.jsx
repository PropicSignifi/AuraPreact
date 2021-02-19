import { h, render, Component } from 'preact';
import Utils from '../utils/utils';
import BaseComponent from '../base/baseComponent';
import Layer from './layer';
import Modal from '../modal/modal';
import Button from '../button/button';
import styles from './app.less';
import Actions from '../utils/actions';
import Config from '../utils/config';
import PropTypes from '../propTypes/propTypes';

import SearchBar from './searchBar';
import CustomActions from './customActions';
import KeyboardShortcuts from './keyboardShortcuts';
import Help from './help';
import Notifications from './notifications';
import NewTask from './newTask';
import ChatBot from './chatBot';

Config.defineConfig([
    {
        name: 'System UI Config',
        path: '/System/UI/Config/',
        type: 'Folder',
        description: 'Override the system UI config, like date/time formats',
    },
    {
        name: 'System UI Custom Style',
        path: '/System/UI/App/customStyle',
        type: Config.Types.Extension,
        description: 'The extension to apply new css rules, in css format',
    },
    {
        name: 'Quick Actions',
        path: '/System/UI/App/actions/extension',
        type: Config.Types.Extension,
        description: 'Customise launching quick actions',
    },
]);

const globalZoneLoaded = {};

export default class App extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            modal: {
                visible: false,
                loading: false,
                options: {},
                data: {},
            },
        });

        this.bind([
            'showModal',
            'hideModal',
            'getModalState',
            'setModalState',
        ]);

        this.mainNode = null;
        this.layerNode = null;
        this.layeredEditorUI = null;
        this.layeredEditorId = null;
        this.$cancelCallback = null;
        this.layer = null;
    }

    componentDidMount() {
        super.componentDidMount();

        Utils.registerApp(_.get(this.props.globalData, 'preactContainer'), this);

        this.registerActions();
        this.loadCustomStyle();
        this.overrideConfig();
        this.initGlobalZones();
    }

    overrideConfig() {
        const mappings = Config.getValues('/System/UI/Config/', this.props.globalData);
        const config = window.$Config.getConfig();
        _.forEach(mappings, (value, key) => {
            config[key] = value;
        });
    }

    loadCustomStyle() {
        const styleName = Config.getValue('/System/UI/App/customStyle', this.props.globalData);
        if(styleName) {
            return Promise.all(
                _.chain(styleName)
                    .split(';')
                    .compact()
                    .map(Utils.loadStaticResource)
                    .value()
            ).then(styles => {
                _.forEach(styles, data => {
                    const css = document.createElement('style');
                    css.appendChild(document.createTextNode(data.body));
                    this.mainNode.appendChild(css);
                });
            });
        }
    }

    registerActions() {
        Actions.init();

        Actions.registerAction('Home', '/lightning/page/home');

        if(_.includes(Config.getValue('/System/UserInfo[Readonly]/Features'), 'AccessConfigTree')) {
            Actions.registerAction('Config', () => {
                Utils.openComponentPage('c:configTree');
            });
        }

        Config.loadExtension('/System/UI/App/actions/extension', this.props.globalData)
            .then(resources => {
                return Promise.all(_.map(resources, Utils.retrieve));
            })
            .then(extensions => {
                _.forEach(extensions, extension => {
                    const actions = _.isArray(extension) ? extension : [extension];
                    _.forEach(actions, action => {
                        if(!action) {
                            return;
                        }

                        if(!action.name) {
                            throw new Error('Failed to find action name when registering actions');
                        }

                        Actions.registerAction(action.name, action);
                    });
                });
            });
    }

    initGlobalZones() {
        const globalZones = Utils.getGlobalZones();

        _.forEach(globalZones, globalZone => {
            const globalZoneName = `global-zone-${globalZone.name}`;
            const isGlobalZoneAvailable = _.isFunction(globalZone.isAvailable) ? globalZone.isAvailable() : true;
            if(isGlobalZoneAvailable && !globalZoneLoaded[globalZone.name]) {
                globalZoneLoaded[globalZone.name] = true;

                window.requestAnimationFrame(() => {
                    if($(`[data-locator="${globalZoneName}"]`).length === 0) {
                        if(_.isFunction(globalZone.render)) {
                            globalZone.render(globalZoneName);
                        }
                        else if(_.isFunction(globalZone.renderApp)) {
                            const childApp = globalZone.renderApp();
                            const container = document.createElement('div');
                            container.setAttribute('data-locator', globalZoneName);
                            if(globalZone.className) {
                                container.classList.add(globalZone.className);
                            }
                            document.body.appendChild(container);

                            render(childApp, container);
                        }
                    }
                });
            }
            else if(!isGlobalZoneAvailable && globalZoneLoaded[globalZone.name]) {
                window.requestAnimationFrame(() => {
                    const zones = $(`[data-locator="${globalZoneName}"]`);
                    zones.each(function() {
                        this.remove();
                    });
                });
            }
        });
    }

    setLayeredEditorUI(vdom, cancelCallback, id) {
        if(this.layeredEditorUI && this.layeredEditorId !== id) {
            return;
        }

        this.layeredEditorUI = vdom;
        this.layeredEditorId = id;
        this.$cancelCallback = cancelCallback;

        this.updateLayer();

        if(this.mainNode) {
            this.mainNode.classList.remove(!!this.layeredEditorUI ? "slds-show" : "slds-hide");
            this.mainNode.classList.add(!!this.layeredEditorUI ? "slds-hide" : "slds-show");
        }
        if(this.layerNode) {
            this.layerNode.classList.remove(!!this.layeredEditorUI ? "slds-hide" : "slds-show");
            this.layerNode.classList.add(!!this.layeredEditorUI ? "slds-show" : "slds-hide");
        }
    }

    updateLayer() {
        if(this.layer) {
            this.layer.forceUpdate();
        }
    }

    registerLayer(layer) {
        this.layer = layer;
    }

    getChildContext(context) {
        return _.assign({}, super.getChildContext(context), {
            setLayeredEditorUI: this.setLayeredEditorUI.bind(this),
            registerLayer: this.registerLayer.bind(this),
            globalData: this.props.globalData,
        });
    }

    createLayeredEditor() {
        if(_.isFunction(this.layeredEditorUI)) {
            return this.layeredEditorUI();
        }
        else {
            return this.layeredEditorUI;
        }
    }

    cancelLayeredEditor() {
        if(_.isFunction(this.$cancelCallback)) {
            this.$cancelCallback();
        }
        else {
            this.setLayeredEditorUI(null);
        }
    }

    setMainNode(node) {
        this.mainNode = node;
    }

    setLayerNode(node) {
        this.layerNode = node;
    }

    showModal(options) {
        this.setState({
            modal: _.assign({}, this.state.modal, {
                visible: true,
                loading: false,
                options: options || {},
                data: _.assign({}, options.state),
            }),
        });
    }

    hideModal(save) {
        return Promise.resolve(save).then(save => {
            if(save === true && _.isFunction(this.state.modal.options.onSave)) {
                this.setState({
                    modal: _.assign({}, this.state.modal, {
                        loading: true,
                    }),
                });

                return Promise.resolve(this.state.modal.options.onSave(this.state.modal.data)).then(() => {
                    this.setState({
                        modal: _.assign({}, this.state.modal, {
                            loading: false,
                        }),
                    });
                });
            }
        }).then(() => {
            this.setState({
                modal: _.assign({}, this.state.modal, {
                    visible: false,
                    loading: false,
                    options: {},
                    data: {},
                }),
            });
        });
    }

    getModalState(key) {
        return _.get(this.state.modal.data, key);
    }

    setModalState(key, value) {
        this.setState({
            modal: _.assign({}, this.state.modal, {
                data: _.assign({}, this.state.modal.data, {
                    [key]: value,
                }),
            }),
        });
    }

    renderModalFooter() {
        return (
            <div className="slds-grid">
                <Button
                    className="slds-col_bump-left"
                    label={ this.state.modal.options.onCancelText || 'Cancel' }
                    onClick={ this.hideModal }
                >
                </Button>
                <Button
                    label={ this.state.modal.options.onSaveText || 'Yes' }
                    variant="primary"
                    type="submit"
                    onClick={ () => this.hideModal(true) }
                >
                </Button>
            </div>
        );
    }

    render(props, state) {
        const [{
            globalData,
            applyBottomSpace,
            applyTopSpace,
            children,
        }, rest] = this.getPropValues();

        const ModalComp = this.state.modal.options.modalClass || Modal;

        return (
            <div data-type={ this.getTypeName() }>
                <div ref={ node => this.setMainNode(node) } className={
                    window.$Utils.classnames(
                        'slds-show',
                        {
                            'slds-m-bottom_xx-large': applyBottomSpace && window.$Utils.isComponentPage(),
                        }
                    )
                }>
                    { children }
                </div>
                <div ref={ node => this.setLayerNode(node) } className={ window.$Utils.classnames(
                    `${styles.rootPanel} slds-hide`,
                    {
                        [styles.rootPanelBuffer]: applyTopSpace && !window.$Utils.getRegionWidth() && !window.$Utils.isNonDesktopBrowser(),
                    }
                    ) }>
                    <Layer onCancel={ this.cancelLayeredEditor.bind(this) } onCreate={ this.createLayeredEditor.bind(this) }>
                    </Layer>
                </div>
                <SearchBar></SearchBar>
                <CustomActions></CustomActions>
                <KeyboardShortcuts></KeyboardShortcuts>
                <Help></Help>
                <Notifications></Notifications>
                <NewTask></NewTask>
                <ChatBot></ChatBot>
                {
                    this.state.modal.visible && (
                    <ModalComp
                        className={ this.state.modal.options.className }
                        visible={ this.state.modal.visible }
                        alwaysModal={ this.state.modal.options.alwaysModal }
                        loading={ this.state.modal.loading }
                        header={ this.state.modal.options.header }
                        footer={ this.renderModalFooter() }
                        onSave={ () => this.hideModal(true) }
                        onClose={ this.hideModal }
                        onSaveText={ this.state.modal.options.onSaveText }
                        onCancelText={ this.state.modal.options.onCancelText }
                    >
                        {
                            this.state.modal.options.renderContent && this.state.modal.options.renderContent(this.getModalState, this.setModalState)
                        }
                        {
                            this.state.modal.options.message && (
                            <p>
                                { this.state.modal.options.message }
                            </p>
                            )
                        }
                    </ModalComp>
                    )
                }
            </div>
        );
    }
}

App.propTypes = {
    globalData: PropTypes.isObject('globalData'),
    applyBottomSpace: PropTypes.isBoolean('applyBottomSpace').defaultValue(true),
    applyTopSpace: PropTypes.isBoolean('applyTopSpace').defaultValue(true),
    children: PropTypes.isChildren('children'),
};

App.propTypesRest = true;
App.displayName = "App";
