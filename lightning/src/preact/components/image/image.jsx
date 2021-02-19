import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Spinner from '../spinner/spinner';
import styles from './styles.css';

export default class Image extends BaseComponent {
    constructor() {
        super();

        this.state = {
            loading: true,
            success: false,
        };

        window.setTimeout(() => {
            this.setState({
                loading: false,
            });
        }, 3000);
    }

    onLoad(e) {
        this.setState({
            loading: false,
            success: true,
        });
    }

    onError(e) {
        this.setState({
            loading: false,
            success: false,
        });
    }

    setImage(image) {
        this.image = image;

        if(this.state.loading && this.imgLoaded()) {
            this.onLoad(null);
        }
    }

    imgLoaded() {
        return this.image && this.image.complete && this.image.naturalHeight !== 0;
    }

    render(props, state) {
        const [{
            className,
            src,
            alt,
            width,
            height,
            altSrc,
        }, rest] = this.getPropValues();

        const divStyle = {
            width: width + "px",
            height: height + "px",
        };

        const imgStyle = {
            width: (_.includes(width, '%') || _.includes(width, 'auto')) ? width : width + "px",
            height: (_.includes(height, '%') || _.includes(height, 'auto')) ? height : height + "px",
            display: (!state.success && altSrc) ? 'none' : 'block',
        };

        return (
            <div className={ window.$Utils.classnames(
                styles.imageContainer,
                className
                ) } style={ divStyle } data-type={ this.getTypeName() } { ...rest }>
                {
                    state.loading ?
                    <Spinner size="small" alternativeText="loading" text={ alt }/>
                    :
                    null
                }
                <img ref={ node => this.setImage(node) } src={ src } alt={ alt } style={ imgStyle } onLoad={ e => this.onLoad(e) } onError={ e => this.onError(e) }/>
            {
                !state.success && altSrc ?
                <img src={ altSrc } alt={ alt } style={ divStyle }/>
                :
                null
            }
            </div>
        );
    }
}

Image.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    src: PropTypes.isString('src').demoValue('https://static.pexels.com/photos/40784/drops-of-water-water-nature-liquid-40784.jpeg'),
    alt: PropTypes.isString('alt').required().demoValue('Image'),
    width: PropTypes.isString('width').defaultValue(200).demoValue(200),
    height: PropTypes.isString('height').defaultValue(100).demoValue(100),
    altSrc: PropTypes.isString('altSrc').demoValue(''),
};

Image.propTypesRest = true;
Image.displayName = "Image";
