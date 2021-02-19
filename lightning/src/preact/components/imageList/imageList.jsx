import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import FlatPanel from '../flatPanel/flatPanel';
import Image from '../image/image';
import styles from './styles.less';

export default class ImageList extends BaseComponent {
    constructor() {
        super();

        this.state = {
            itemToPreview: null,
        };
    }

    onKeyUp(e) {
        if(e.keyCode === 27) {
            this.onCloseImageModal(e);
        }
    }

    componentDidMount() {
        window.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("keyup", this.onKeyUp.bind(this));
    }

    isSortable() {
        if(!this.prop('sortable') || window.$Utils.isNonDesktopBrowser()){
            return false;
        } else return true;
    }


    createOverlayControls(item) {
        if(_.isFunction(this.prop('createOverlayControls')) && !window.$Utils.isNonDesktopBrowser()) {
            return this.prop('createOverlayControls')(item);
        }

        return null;
    }

    onDragStart(e, item) {
        if(!this.isSortable()) {
            return;
        }

        e.dataTransfer.setData('id', item.id);
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

    onDragLeave(e) {
        if(!this.isSortable()) {
            return;
        }

        const element = this.getDraggableElement(e.target);
        if(element) {
            element.classList.remove(styles.insertIndicator);
        }
    }

    onDragOver(e) {
        if(!this.isSortable()) {
            return;
        }

        e.preventDefault();

        const element = this.getDraggableElement(e.target);
        if(element) {
            element.classList.add(styles.insertIndicator);
        }
    }

    onDrop(e, item) {
        if(!this.isSortable()) {
            return;
        }

        this.onDragLeave(e);

        e.preventDefault();

        const srcId = e.dataTransfer.getData('id');
        const destId = item.id;
        const oldFiles = this.prop('value');
        const srcIndex = _.findIndex(oldFiles, ['id', srcId]);
        const destIndex = _.findIndex(oldFiles, ['id', destId]);
        if(srcIndex === destIndex) {
            return;
        }
        if(srcIndex >= 0 && destIndex >= 0) {
            const insertIndex = srcIndex > destIndex ? destIndex : destIndex - 1;
            const draggedFile = _.find(oldFiles, ['id', srcId]);
            const removedFiles = _.without(oldFiles, draggedFile);
            const newFiles = [
                ..._.slice(removedFiles, 0, insertIndex),
                draggedFile,
                ..._.slice(removedFiles, insertIndex)
            ];

            if(_.isFunction(this.prop('onValueChange'))) {
                this.prop('onValueChange')(newFiles);
            }
        }
    }

    onClickImage(e, item) {
        if(window.$Utils.isNonDesktopBrowser()){
            return;
        }
        this.setState({
            itemToPreview: item,
        });
    }

    onCloseImageModal(e) {
        this.setState({
            itemToPreview: null,
        });
    }

    createImageControl(item) {
        const imageWidth = this.prop('imageWidth');
        const imageHeight = this.prop('imageHeight');
        const imagesOverlayContainerStyle = {
            width: imageWidth + 'px',
            height: imageHeight + 'px',
        };
        const overlayControls = this.createOverlayControls(item);
        const hasOverlay = !!overlayControls;

        return (
            <div
                id={ item.id }
                class={ window.$Utils.classnames(
                    'slds-m-vertical_small',
                    'slds-is-relative',
                    {
                        'image-overlay-container': hasOverlay,
                        [styles.draggable]: this.prop('sortable'),
                    }
                ) }
                style={ hasOverlay ? imagesOverlayContainerStyle : {} }
                draggable={ this.prop('sortable') }
                onDragStart={ e => this.onDragStart(e, item) }
                onDragOver={ e => this.onDragOver(e) }
                onDragLeave={ e => this.onDragLeave(e) }
                onDrop={ e => this.onDrop(e, item) }
            >
                {
                    hasOverlay ? (<div className="image-overlay-background"/>) : null
                }
                <Image
                    key={ item.id }
                    className={ styles.imageStyle }
                    src={ item.url }
                    alt={ item.name || item.id }
                    width={ imageWidth }
                    height={ imageHeight }
                    onClick={ e => this.onClickImage(e, item) }
                ></Image>
                {
                    item.name ? (<div className={ styles.imageBanner }>{ item.name }</div>) : null
                }
                {
                    hasOverlay ?
                    <div className="image-overlay">
                        { this.createOverlayControls(item) }
                    </div>
                    : null
                }
            </div>
        );
    }

    render(props, state) {
        const [{
            className,
            header,
            expandable,
            expanded,
            onClickHeader,
            imageWidth,
            imageHeight,
            maxHeight,
            value,
            children,
        }, rest] = this.getPropValues();

        const imagesFlowStyle = {
        };

        if(maxHeight > 0) {
            imagesFlowStyle.maxHeight = maxHeight + 'px';
        }

        return (
            <FlatPanel
                className={ className }
                header={ header }
                expandable={ expandable }
                expanded={ expanded }
                style="panel"
                onClickHeader={ onClickHeader }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <div className="slds-m-around_small">
                    <div className={ window.$Utils.classnames(
                        'slds-grid slds-wrap slds-grid_align-space',
                        {
                            'slds-scrollable_y': maxHeight > 0,
                        }
                        ) }
                        style={ imagesFlowStyle }
                    >
                    {
                        _.map(value, this.createImageControl.bind(this))
                    }
                    </div>
                    <div className="slds-m-top_small">
                        { children }
                    </div>
                </div>
                <div
                    className={ window.$Utils.classnames(
                        styles.imageModal,
                        {
                            'slds-hide': !state.itemToPreview,
                            'slds-show': state.itemToPreview,
                        }
                    ) }
                >
                    <span className="close" onClick={ e => this.onCloseImageModal(e) }>&times;</span>
                    <img className="content" src={ state.itemToPreview ? state.itemToPreview.url : '' }></img>
                    <div className="caption">{ state.itemToPreview ? state.itemToPreview.name : '' }</div>
                </div>
            </FlatPanel>
        );
    }
}

ImageList.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    value: PropTypes.isArray('value').shape({
        id: PropTypes.isString('id').required(),
        name: PropTypes.isString('name'),
        url: PropTypes.isString('url').required(),
    }),
    header: PropTypes.isString('header').required().demoValue('Image List'),
    expandable: PropTypes.isBoolean('expandable').demoValue(true).defaultValue(true),
    expanded: PropTypes.isBoolean('expanded').demoValue(false).defaultValue(false),
    onClickHeader: PropTypes.isFunction('onClickHeader'),
    imageWidth: PropTypes.isNumber('imageWidth').demoValue(200).defaultValue(200),
    imageHeight: PropTypes.isNumber('imageHeight').demoValue(150).defaultValue(150),
    maxHeight: PropTypes.isNumber('maxHeight').demoValue(-1).defaultValue(-1),
    createOverlayControls: PropTypes.isFunction('createOverlayControls'),
    sortable: PropTypes.isBoolean('sortable').demoValue(false).defaultValue(false),
    onValueChange: PropTypes.isFunction('onValueChange'),
    children: PropTypes.isChildren('children'),
};

ImageList.propTypesRest = true;
ImageList.displayName = "ImageList";
