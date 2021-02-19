import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Utils from '../utils/utils';
import styles from './styles.less';
import Config from '../utils/config';

Config.defineConfig([
    {
        name: 'Frameset - hide child',
        path: '${configPath}/${childName}/hidden',
        type: Config.Types.Boolean,
        description: 'Hide a frame in the frameset',
    },
]);

const Direction = {
    Top: 'Top',
    Bottom: 'Bottom',
    Left: 'Left',
    Right: 'Right',
};

export default class Frameset extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            frames: null,
            focusedFrame: null,
        });

        this.$frames = {};
    }

    componentDidMount() {
        super.componentDidMount();

        const frameStates = window.$UserConfigStore.getConfig(this.prop('name'));

        const state = {};
        _.forEach(this.$frames, frame => {
            const frameState = this.getDefaultFrameState(frame);
            const newFrameState = _.assign({}, frameState, frameStates && frameStates[frameState.name]);
            state[newFrameState.name] = newFrameState;
        });
        this.setFrameStates(state);
    }

    getDefaultFrameState(frame) {
        return {
            name: frame.attributes.name,
            row: _.toNumber(frame.attributes.row),
            column: _.toNumber(frame.attributes.column),
            minimized: _.toString(frame.attributes.minimized) === 'true',
            maximized: _.toString(frame.attributes.maximized) === 'true',
        };
    }

    getFrameStates() {
        return this.state.frames;
    }

    setFrameStates(frameStates) {
        this.setState({
            frames: frameStates,
        }, () => {
            Utils.delay(() => {
                window.$UserConfigStore.setConfig(this.prop('name'), this.state.frames);
            }, 0);
        });
    }

    getColumnGroups() {
        return _.groupBy(this.getFrameStates(), frameState => `${frameState.column}`);
    }

    onMinimizeWindow(frame) {
        if(frame.minimized || frame.maximized) {
            return;
        }

        this.updateFrameState(frame.name, {
            minimized: true,
        });
    }

    onFocusOut() {
        this.focusFrame(null);
    }

    onMaximizeWindow(frame) {
        if(frame.minimized || frame.maximized) {
            return;
        }

        this.updateFrameState(frame.name, {
            maximized: true,
        });
    }

    onRestoreWindow(frameName) {
        this.updateFrameState(frameName, {
            minimized: false,
            maximized: false,
        });
    }

    updateFrameState(frameName, changes) {
        const frameStates = this.getFrameStates();
        const newFrameStates = _.assign({}, frameStates, {
            [frameName]: _.assign({}, frameStates[frameName], changes),
        });
        this.setFrameStates(newFrameStates);
    }

    getMaximizedFrameState() {
        return _.find(this.getFrameStates(), ['maximized', true]);
    }

    onDragStart(frameState, e) {
        e.dataTransfer.setData('name', frameState.name);
    }

    getDraggableElement(node) {
        let curr = node;
        while(true) {
            if(!curr || !_.isFunction(curr.getAttribute) || curr.getAttribute('draggable')) {
                break;
            }

            curr = curr.parentElement;
        }

        return curr;
    }

    getDragDirection(e) {
        const element = this.getDraggableElement(e.target);
        if(element) {
            const rect = element.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            const x_range = rect.width * 0.3;
            const y_range = rect.height * 0.3;
            if(x > rect.x + x_range && x < rect.x + rect.width - x_range &&
                y > rect.y && y < rect.y + y_range) {
                return Direction.Top;
            }
            else if(x > rect.x + x_range && x < rect.x + rect.width - x_range &&
                y > rect.y + rect.height - y_range && y < rect.y + rect.height) {
                return Direction.Bottom;
            }
            else if(x > rect.x && x < rect.x + x_range &&
                y > rect.y + y_range && y < rect.y + rect.height - y_range) {
                return Direction.Left;
            }
            else if(x > rect.x + rect.width - x_range && x < rect.x + rect.width &&
                y > rect.y + y_range && y < rect.y + rect.height - y_range) {
                return Direction.Right;
            }
        }
    }

    setDragStyle(element, direction) {
        if(element.classList) {
            element.classList.remove(styles.insertIndicatorTop);
            element.classList.remove(styles.insertIndicatorBottom);
            element.classList.remove(styles.insertIndicatorLeft);
            element.classList.remove(styles.insertIndicatorRight);

            if(direction) {
                element.classList.add(styles[`insertIndicator${direction}`]);
            }
        }
    }

    onDragLeave(e) {
        const element = this.getDraggableElement(e.target);
        if(element) {
            this.setDragStyle(element, null);
        }
    }

    onDragOver(e) {
        e.preventDefault();

        const element = this.getDraggableElement(e.target);
        if(element) {
            const direction = this.getDragDirection(e);
            if(direction) {
                this.setDragStyle(element, direction);
            }
        }
    }

    onDblClick(frameState, e) {
        if(frameState.maximized) {
            this.onRestoreWindow(frameState.name);
        }
        else {
            this.onMaximizeWindow(frameState);
        }
    }

    focusFrame(name) {
        this.setState({
            focusedFrame: name,
        });
    }

    onKeyDown(e) {
        const frameStates = this.getFrameStates();
        const frameState = frameStates[this.state.focusedFrame];
        if(!frameState) {
            return;
        }

        if(e.keyCode === 27) {
            // Esc
            if(frameState.maximized) {
                this.onRestoreWindow(frameState.name);
            }
            else {
                this.focusFrame(null);
            }

            e.preventDefault();
        }
        else if(e.keyCode === 38) {
            // Up
            const frameStates = this.getFrameStates();
            const topFrameState = this.getFrameOnTop(frameState);
            if(topFrameState) {
                if(e.shiftKey) {
                    let newFrameStates = this.moveToTop(frameState, topFrameState);
                    this.setFrameStates(_.assign(frameStates, newFrameStates));
                }
                else {
                    this.focusFrame(topFrameState.name);
                }
            }

            e.preventDefault();
        }
        else if(e.keyCode === 40) {
            // Down
            const frameStates = this.getFrameStates();
            const bottomFrameState = this.getFrameOnBottom(frameState);
            if(bottomFrameState) {
                if(e.shiftKey) {
                    let newFrameStates = this.moveToBottom(frameState, bottomFrameState);
                    this.setFrameStates(_.assign(frameStates, newFrameStates));
                }
                else {
                    this.focusFrame(bottomFrameState.name);
                }
            }

            e.preventDefault();
        }
        else if(e.keyCode === 37) {
            // Left
            const frameStates = this.getFrameStates();
            const leftFrameState = this.getFrameOnLeft(frameState);
            if(leftFrameState) {
                if(e.shiftKey) {
                    let newFrameStates = this.moveToBottom(frameState, leftFrameState);
                    this.setFrameStates(_.assign(frameStates, newFrameStates));
                }
                else {
                    this.focusFrame(leftFrameState.name);
                }
            }
            else {
                if(e.shiftKey) {
                    let newFrameStates = this.moveToLeft(frameState, frameState);
                    this.setFrameStates(_.assign(frameStates, newFrameStates));
                }
            }

            e.preventDefault();
        }
        else if(e.keyCode === 39) {
            // Right
            const frameStates = this.getFrameStates();
            const rightFrameState = this.getFrameOnRight(frameState);
            if(rightFrameState) {
                if(e.shiftKey) {
                    let newFrameStates = this.moveToBottom(frameState, rightFrameState);
                    this.setFrameStates(_.assign(frameStates, newFrameStates));
                }
                else {
                    this.focusFrame(rightFrameState.name);
                }
            }
            else {
                if(e.shiftKey) {
                    let newFrameStates = this.moveToRight(frameState, frameState);
                    this.setFrameStates(_.assign(frameStates, newFrameStates));
                }
            }

            e.preventDefault();
        }
        else if(e.keyCode === 13) {
            // Enter
            this.onMaximizeWindow(frameState);

            e.preventDefault();
        }
    }

    onClick(frameState, e) {
        this.focusFrame(frameState.name);
    }

    getColumnGroup(column) {
        const group = _.chain(this.getFrameStates())
            .values()
            .filter(['column', column])
            .sortBy('row')
            .value();
        return group;
    }

    getFrameOnTop(frameState) {
        const group = this.getColumnGroup(frameState.column);
        const index = _.findIndex(group, ['name', frameState.name]);
        return index > 0 ? group[index - 1] : null;
    }

    getFrameOnBottom(frameState) {
        const group = this.getColumnGroup(frameState.column);
        const index = _.findIndex(group, ['name', frameState.name]);
        return index < _.size(group) - 1 ? group[index + 1] : null;
    }

    isBefore(frameState1, frameState2) {
        if(frameState1.column < frameState2.column) {
            return true;
        }
        else if(frameState1.column > frameState2.column) {
            return false;
        }
        else {
            return frameState1.row < frameState2.row;
        }
    }

    getFrameOnLeft(frameState) {
        return _.chain(this.getFrameStates())
            .values()
            .filter(item => item.column < frameState.column)
            .reduce((prev, item) => {
                if(prev) {
                    return this.isBefore(prev, item) ? item : prev;
                }
                else {
                    return item;
                }
            }, null)
            .value();
    }

    getFrameOnRight(frameState) {
        const columnGroups = this.getColumnGroups();
        const columns = _.chain(columnGroups)
            .keys()
            .sortBy(_.toNumber)
            .value();
        const index = _.indexOf(columns, `${frameState.column}`);
        if(index < _.size(columns) - 1) {
            const nextColumn = _.toNumber(columns[index + 1]);
            const group = this.getColumnGroup(nextColumn);
            return _.last(group);
        }
    }

    moveToTop(srcFrameState, destFrameState) {
        const newFrameStates = {};
        const group = this.getColumnGroup(destFrameState.column);

        const remainingGroup = _.reject(group, ['name', srcFrameState.name]);
        const index = _.findIndex(remainingGroup, ['name', destFrameState.name]);
        const newGroup = [
            ...(_.slice(remainingGroup, 0, index)),
            srcFrameState,
            ...(_.slice(remainingGroup, index)),
        ];

        _.forEach(newGroup, (frameState, index) => {
            const newFrameState = _.assign({}, frameState, {
                row: index,
                column: destFrameState.column,
            });
            newFrameStates[newFrameState.name] = newFrameState;
        });

        return newFrameStates;
    }

    moveToBottom(srcFrameState, destFrameState) {
        const newFrameStates = {};
        const group = this.getColumnGroup(destFrameState.column);

        const remainingGroup = _.reject(group, ['name', srcFrameState.name]);
        const index = _.findIndex(remainingGroup, ['name', destFrameState.name]);
        const newGroup = [
            ...(_.slice(remainingGroup, 0, index + 1)),
            srcFrameState,
            ...(_.slice(remainingGroup, index + 1)),
        ];

        _.forEach(newGroup, (frameState, index) => {
            const newFrameState = _.assign({}, frameState, {
                row: index,
                column: destFrameState.column,
            });
            newFrameStates[newFrameState.name] = newFrameState;
        });

        return newFrameStates;
    }

    moveToLeft(srcFrameState, destFrameState) {
        const newFrameStates = {};
        const group = this.getColumnGroup(srcFrameState.column);

        const remainingGroup = _.reject(group, ['name', srcFrameState.name]);

        _.forEach(remainingGroup, (frameState, index) => {
            const newFrameState = _.assign({}, frameState, {
                row: index,
            });
            newFrameStates[newFrameState.name] = newFrameState;
        });

        const newFrameState = _.assign({}, srcFrameState, {
            column: destFrameState.column - 1,
        });
        newFrameStates[newFrameState.name] = newFrameState;

        return newFrameStates;
    }

    moveToRight(srcFrameState, destFrameState) {
        const newFrameStates = {};
        const group = this.getColumnGroup(srcFrameState.column);

        const remainingGroup = _.reject(group, ['name', srcFrameState.name]);

        _.forEach(remainingGroup, (frameState, index) => {
            const newFrameState = _.assign({}, frameState, {
                row: index,
            });
            newFrameStates[newFrameState.name] = newFrameState;
        });

        const newFrameState = _.assign({}, srcFrameState, {
            column: destFrameState.column + 1,
        });
        newFrameStates[newFrameState.name] = newFrameState;

        return newFrameStates;
    }

    onDrop(destFrameState, e) {
        this.onDragLeave(e);

        e.preventDefault();

        const direction = this.getDragDirection(e);
        if(!direction) {
            return;
        }

        const srcName = e.dataTransfer.getData('name');
        const frameStates = this.getFrameStates();
        const srcFrameState = frameStates[srcName];

        let newFrameStates = {};

        if(direction === Direction.Top) {
            newFrameStates = this.moveToTop(srcFrameState, destFrameState);
        }
        else if(direction === Direction.Bottom) {
            newFrameStates = this.moveToBottom(srcFrameState, destFrameState);
        }
        else if(direction === Direction.Left) {
            newFrameStates = this.moveToLeft(srcFrameState, destFrameState);
        }
        else if(direction === Direction.Right) {
            newFrameStates = this.moveToRight(srcFrameState, destFrameState);
        }

        this.setFrameStates(_.assign(frameStates, newFrameStates));
    }

    renderFrame(frameState, className) {
        const id = this.id();
        const frame = this.$frames[frameState.name];

        if(frame){
            return (
                <section
                    draggable="true"
                    className={ window.$Utils.classnames(
                        "slds-frame slds-grid slds-grid_vertical slds-m-vertical_medium",
                        frame.attributes.className,
                        className,
                        {
                            'slds-is-open': !frameState.minimized,
                            'slds-has-focus': this.state.focusedFrame === frameState.name && !frameState.maximized,
                        }
                    ) }
                    role="dialog"
                    aria-labelledby={ `${id}-${frameState.name}-heading` }
                    aria-describedby={ `${id}-${frameState.name}-content` }
                    onDragStart={ this.onDragStart.bind(this, frameState) }
                    onDragOver={ this.onDragOver.bind(this) }
                    onDragLeave={ this.onDragLeave.bind(this) }
                    onDrop={ this.onDrop.bind(this, frameState) }
                    data-type="Frame"
                    data-name={ frameState.name }
                >
                    <header
                        className="slds-frame__header slds-grid slds-shrink-none"
                        aria-live="assertive"
                        onDblClick={ this.onDblClick.bind(this, frameState) }
                        onClick={ this.onClick.bind(this, frameState) }
                    >
                        <div className="slds-media slds-media_center slds-no-space">
                            {
                                frame.attributes.iconName && (
                                    <div className="slds-media__figure slds-m-right_x-small">
                            <span className="slds-icon_container">
                                <PrimitiveIcon
                                    variant="bare"
                                    className="slds-icon slds-icon_xx-small slds-icon-text-default"
                                    iconName={ frame.attributes.iconName }
                                >
                                </PrimitiveIcon>
                            </span>
                                    </div>
                                )
                            }
                            <div className="slds-media__body">
                                <h2 className="slds-truncate" id={ `${id}-${frameState.name}-heading` } title="Header">{ frame.attributes.label }</h2>
                            </div>
                        </div>
                        <div className="slds-col_bump-left slds-shrink-none">
                            {
                                !frameState.minimized && !frameState.maximized && (
                                    <button
                                        className="slds-button slds-button_icon slds-button_icon"
                                        title="Minimize window"
                                        onClick={ this.onMinimizeWindow.bind(this, frameState) }
                                    >
                                        <PrimitiveIcon
                                            variant="bare"
                                            className="slds-button__icon"
                                            iconName="utility:minimize_window"
                                        >
                                        </PrimitiveIcon>
                                        <span className="slds-assistive-text">Minimize Window</span>
                                    </button>
                                )
                            }
                            {
                                !frameState.minimized && !frameState.maximized && !window.$Utils.isMobileScreenSize() && (
                                    <button
                                        className="slds-button slds-button_icon slds-button_icon"
                                        title="Expand Composer"
                                        onClick={ this.onMaximizeWindow.bind(this, frameState) }
                                    >
                                        <PrimitiveIcon
                                            variant="bare"
                                            className="slds-button__icon"
                                            iconName="utility:expand_alt"
                                        >
                                        </PrimitiveIcon>
                                        <span className="slds-assistive-text">Expand Window</span>
                                    </button>
                                )
                            }
                            {
                                (frameState.minimized || frameState.maximized) && (
                                    <button
                                        className="slds-button slds-button_icon slds-button_icon"
                                        title="Restore"
                                        onClick={ this.onRestoreWindow.bind(this, frameState.name) }
                                    >
                                        <PrimitiveIcon
                                            variant="bare"
                                            className="slds-button__icon"
                                            iconName="utility:layers"
                                        >
                                        </PrimitiveIcon>
                                        <span className="slds-assistive-text">Restore Window</span>
                                    </button>
                                )
                            }
                        </div>
                    </header>
                    <div className="slds-frame__body" id={ `${id}-${frameState.name}-content` }>
                        { frame.children }
                    </div>
                    {
                        frame.attributes.actions && (
                            <footer className="slds-frame__footer slds-shrink-none">
                                <div className="slds-col_bump-left slds-text-align_right">
                                    { frame.attributes.actions }
                                </div>
                            </footer>
                        )
                    }
                </section>
            );
        }
    }

    render(props, state) {
        const [{
            className,
            name,
            children,
        }, rest] = this.getPropValues();

        this.$frames = {};
        _.each(children, child => {
            let hidden = false;

            if(child && this.props.configPath){
                const path = this.props.configPath + "/" + child.attributes.name + "/hidden";
                hidden = Config.getValue(path, this.context.globalData);
            }
            if(child && child.attributes.name && !hidden) {
                this.$frames[child.attributes.name] = child;
            }
        });

        const columnGroups = this.getColumnGroups();
        const numOfGroups = _.size(columnGroups);

        const maximizedFrameState = this.getMaximizedFrameState();

        return (
            <div
                className={ `slds-frameset ${className}` }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                {
                    maximizedFrameState ?
                    <div
                        className="slds-grid slds-wrapper"
                        onKeyDown={ this.onKeyDown.bind(this) }
                        onFocusOut={ this.onFocusOut.bind(this) }
                        tabIndex="0"
                    >
                        {
                            this.renderFrame(maximizedFrameState, 'slds-col')
                        }
                    </div>
                    :
                    <div
                        className="slds-grid slds-gutters slds-wrap slds-wrapper"
                        onKeyDown={ this.onKeyDown.bind(this) }
                        onFocusOut={ this.onFocusOut.bind(this) }
                        tabIndex="0"
                    >
                        {
                            _.chain(columnGroups)
                                .keys()
                                .sortBy(_.toNumber)
                                .map(key => {
                                    const group = columnGroups[key];
                                    return (
                                    <div className={ `slds-col slds-size_1-of-1 slds-small-size_1-of-${numOfGroups}` }>
                                        {
                                            _.map(_.sortBy(group, 'row'), this.renderFrame.bind(this))
                                        }
                                    </div>
                                    );
                                })
                                .value()
                        }
                    </div>
                }
            </div>
        );
    }
}

Frameset.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    name: PropTypes.isString('name').required(),
    children: PropTypes.isChildren('children'),
    configPath: PropTypes.isString('configPath'),
};

Frameset.propTypesRest = true;
Frameset.displayName = "Frameset";
