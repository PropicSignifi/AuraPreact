import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import styles from './styles.less';

const format = 'application/json';

const data = {};

const setData = (e, val) => {
    const _data = JSON.stringify(val);
    e.dataTransfer.effectAllowed = 'all';
    e.dataTransfer.setData(format, _data);
    data[format] = _data;
};

const getData = e => {
    let val = e.dataTransfer.getData(format) || data[format];

    let ret = null;
    try {
        ret = JSON.parse(val);
    }
    catch(e) {
    }

    return ret;
};

const clearData = e => {
    delete data[format];
};

export default class DnD extends BaseComponent {
    constructor() {
        super();

        this.state = {
        };

        this.bind([
            'setRef',
            'onMouseDown',
            'onMouseUp',
            'onDragStart',
            'onDragEnd',
            'onDragOver',
            'onDragLeave',
            'onDrop',
        ]);

        this.$node = null;
    }

    setRef(node) {
        this.$node = node;
    }

    setDragStyle(element) {
        if(element.classList) {
            element.classList.add(this.prop('dropClassName') || styles.draggable);
        }
    }

    unsetDragStyle(element) {
        if(element.classList) {
            element.classList.remove(this.prop('dropClassName') || styles.draggable);
        }
    }

    onMouseDown(ev) {
        if(!this.prop('draggable')) {
            return;
        }

        if(this.$node && this.prop('dragClassName')) {
            this.$node.classList.add(this.prop('dragClassName'));
        }
    }

    onMouseUp(ev) {
        if(!this.prop('draggable')) {
            return;
        }

        if(this.$node && this.prop('dragClassName')) {
            this.$node.classList.remove(this.prop('dragClassName'));
        }
    }

    onDragStart(ev) {
        if(!this.prop('draggable')) {
            return;
        }

        setData(ev, this.prop('data'));

        if(this.$node && this.prop('dragClassName')) {
            this.$node.classList.add(this.prop('dragClassName'));
        }
    }

    onDragEnd(ev) {
        if(this.prop('dragClassName')) {
            ev.target.classList.remove(this.prop('dragClassName'));
        }
    }

    onDragOver(ev) {
        // ev.dataTransfer.dropEffect = this.prop('effect');
        ev.preventDefault();

        const data = getData(ev);

        if(_.isFunction(this.prop('allowDrop')) && !this.prop('allowDrop')(data)) {
            return;
        }

        const element = this.$node;
        if(element && this.prop('droppable')) {
            this.setDragStyle(element);
        }
    }

    onDragLeave(ev) {
        const element = this.$node;
        if(element && this.prop('droppable')) {
            this.unsetDragStyle(element);
        }
    }

    onDrop(ev) {
        if(!this.prop('droppable')) {
            return;
        }

        this.onDragLeave(ev);

        ev.preventDefault();

        const data = getData(ev);
        clearData(ev);

        if(_.isFunction(this.prop('allowDrop')) && !this.prop('allowDrop')(data)) {
            return;
        }

        if(_.isFunction(this.prop('onDrop'))) {
            this.prop('onDrop')(data);
        }
    }

    render(props, state) {
        const [{
            className,
            draggable,
            droppable,
            children,
        }, rest] = this.getPropValues();

        return (
            <div
                ref={ this.setRef }
                className={ window.$Utils.classnames(
                className
                ) }
                draggable={ draggable }
                data-type={ this.getTypeName() }
                onDragStart={ this.onDragStart }
                onMouseDown={ this.onMouseDown }
                onMouseUp={ this.onMouseUp }
                onDragEnd={ this.onDragEnd }
                onDragOver={ this.onDragOver }
                onDragLeave={ this.onDragLeave }
                onDrop={ this.onDrop }
                { ...rest }
            >
                { children }
            </div>
        );
    }
}

DnD.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    dragClassName: PropTypes.isString('dragClassName'),
    dropClassName: PropTypes.isString('dropClassName'),
    draggable: PropTypes.isBoolean('draggable'),
    droppable: PropTypes.isBoolean('droppable'),
    data: PropTypes.isObject('data'),
    effect: PropTypes.isString('effect').values([
        'none',
        'copy',
        'move',
        'link',
    ]).defaultValue('none').demoValue('none'),
    onDrop: PropTypes.isFunction('onDrop'),
    allowDrop: PropTypes.isFunction('allowDrop'),
    children: PropTypes.isChildren('children'),
};

DnD.propTypesRest = true;
DnD.displayName = "DnD";
