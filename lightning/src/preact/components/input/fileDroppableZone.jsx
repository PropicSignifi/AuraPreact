import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class FileDroppableZone extends BaseComponent {
    constructor() {
        super();
    }

    handleDragLeave(e) {
        this.dom.classList.remove("slds-has-drag-over");
    }

    handleOnDrop(e) {
        e.preventDefault();
        this.handleDragLeave(e);

        if (this.prop("disabled")) {
            e.stopPropagation();
            return;
        }

        if(_.isFunction(this.prop('onDrop'))) {
            this.prop('onDrop')(e);
        }
    }

    handleOnDragOver(e) {
        e.preventDefault();
        if (!this.prop("disabled")) {
            this.dom.classList.add("slds-has-drag-over");
        }
    }

    setNode(dom) {
        this.dom = dom;
    }

    render(props, state) {
        const {
            className,
            disabled,
            visualizeDropzone,
            children,
        } = this.getPropValues();

        return (
            <div ref={ node => this.setNode(node) } className={ window.$Utils.classnames(
                {
                    'slds-file-selector__dropzone': visualizeDropzone,
                },
                className,
                ) } onDragLeave={ e => this.handleDragLeave(e) } onDrop={e => this.handleOnDrop(e)} onDragOver={ e => this.handleOnDragOver(e) }>
            { children }
            </div>
        );
    }
}

FileDroppableZone.propTypes = {
    className: PropTypes.isString('className'),
    disabled: PropTypes.isBoolean('disabled'),
    visualizeDropzone: PropTypes.isBoolean('visualizeDropzone').defaultValue(true),
    onDrop: PropTypes.isFunction('onDrop'),
    children: PropTypes.isChildren('children'),
};

FileDroppableZone.displayName = "FileDroppableZone";
