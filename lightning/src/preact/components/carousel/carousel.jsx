import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import ButtonIcon from '../buttonIcon/buttonIcon';
import styles from './styles.less';

export default class Carousel extends BaseComponent {
    constructor() {
        super();

        this.state = {
            currentIndex: 0,
        };
    }

    getIndex() {
        return _.isUndefined(this.props.index) ? this.state.currentIndex : this.prop('index');
    }

    setIndex(index) {
        if(_.isFunction(this.prop('onValueChange'))) {
            this.prop('onValueChange')(index);
        }
        else {
            this.setState({
                currentIndex: index,
            });
        }
    }

    getStyle() {
        return {
            transform: `translateX(-${this.getIndex() * 100}%)`,
        };
    }

    getImageTitle(image, index) {
        return image.header || `Image No.${index + 1}`;
    }

    onClickIndicator(index) {
        this.setIndex(index);
    }

    goToPrevImage() {
        let prevIndex = this.getIndex() - 1;
        if(prevIndex < 0) {
            prevIndex = _.size(this.prop('images')) - 1;
        }

        this.onClickIndicator(prevIndex);
    }

    goToNextImage() {
        let nextIndex = this.getIndex() + 1;
        if(nextIndex >= _.size(this.prop('images'))) {
            nextIndex = 0;
        }

        this.onClickIndicator(nextIndex);
    }

    getDescription(image) {
        if(image.render) {
            return (
                <div className="slds-carousel__content">
                    { image.render() }
                </div>
            );
        }
        else if(image.header || image.description) {
            return (
                <div className="slds-carousel__content">
                    <h2 className="slds-carousel__content-title">{ image.header }</h2>
                    <p>{ image.description }</p>
                </div>
            );
        }
        else {
            return null;
        }
    }

    render(props, state) {
        const [{
            className,
            images,
        }, rest] = this.getPropValues();

        return (
            <div className="slds-grid slds-grid_vertical-align-center" data-type={ this.getTypeName() } { ...rest }>
                <ButtonIcon variant="bare" size="large" iconName="utility:chevronleft" alternativeText="Previous Image" onClick={ e => this.goToPrevImage() }/>
                <div className={ window.$Utils.classnames(
                    'slds-carousel',
                    className
                    ) }>
                    <div className="slds-carousel__stage">
                        <div className="slds-carousel__panels" style={ this.getStyle() }>
                            {
                                _.map(images, (image, index) => {
                                    return (
                                        <div key={ index } id={ `content-${index}` } className="slds-carousel__panel" role="tabpanel" aria-hidden={ index === this.getIndex() ? 'true' : 'false' } aria-labelledby={ `indicator-${index}` }>
                                            <a href="javascript:void(0);" className="slds-carousel__panel-action slds-text-link_reset" tabindex="0">
                                                <div className="slds-carousel__image">
                                                    <img src={ image.url } alt={ this.getImageTitle(image, index) }/>
                                                </div>
                                                { this.getDescription(image) }
                                            </a>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <ul className="slds-carousel__indicators" role="tablist">
                            {
                                _.map(images, (image, index) => {
                                    return (
                                        <li className="slds-carousel__indicator" role="presentation">
                                            <a id={ `indicator-${index}` } className={ window.$Utils.classnames(
                                                'slds-carousel__indicator-action',
                                                {
                                                    'slds-is-active': index === this.getIndex(),
                                                }
                                                ) } href="javascript:void(0);" role="tab" tabindex="0" aria-selected={ index === this.getIndex() } aria-controls={ `content-${index}` } title={ this.getImageTitle(image, index) } onclick={ e => this.onClickIndicator(index) }>
                                                <span className="slds-assistive-text">{ this.getImageTitle(image, index) }</span>
                                            </a>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>
                </div>
                <ButtonIcon variant="bare" size="large" iconName="utility:chevronright" alternativeText="Next Image" onClick={ e => this.goToNextImage() }/>
            </div>
        );
    }
}

Carousel.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    images: PropTypes.isArray('images').shape({
        url: PropTypes.isString('url').required(),
        header: PropTypes.isString('header'),
        description: PropTypes.isString('description'),
        render: PropTypes.isFunction('render'),
    }),
    index: PropTypes.isNumber('index'),
    onValueChange: PropTypes.isFunction('onValueChange'),
};

Carousel.propTypesRest = true;
Carousel.displayName = "Carousel";
