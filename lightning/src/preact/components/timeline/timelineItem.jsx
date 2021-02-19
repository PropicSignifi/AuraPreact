import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import FormattedDateTime from '../formattedDateTime/formattedDateTime';

export default class TimelineItem extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const [{
            className,
            variant,
            iconName,
            title,
            time,
            children,
        }, rest] = this.getPropValues();

        return (
            <li>
                <div className={ window.$Utils.classnames('slds-timeline__item', className) } { ...rest }>
                    <span className="slds-assistive-text">{ variant }</span>
                    <div className="slds-media">
                        <div className="slds-media__body" style="min-width: 80%;">
                            <div className={ 'slds-media slds-timeline__media slds-timeline__media_' + variant }>
                                <div className="slds-media__figure slds-timeline__icon">
                                    <div className={ 'slds-icon_container slds-icon-standard-' + variant } title={ variant }>
                                        <PrimitiveIcon variant="bare" iconName={ iconName } className="slds-icon slds-icon_small"></PrimitiveIcon>
                                    </div>
                                </div>
                                <div className="slds-media__body">
                                    <div className="slds-media">
                                        <div className="slds-media__body">
                                            <div className="slds-grid">
                                                {
                                                    _.isString(title) ?
                                                    <h3 className="slds-truncate" title={ title }>{ title }</h3>
                                                    :
                                                    <h3>{ title }</h3>
                                                }
                                                <div className="slds-col slds-timeline__item_line"></div>
                                            </div>
                                            { children }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="slds-media__figure slds-media__figure_reverse" style="flex-shrink: 2;">
                            <div className="slds-timeline__actions">
                                <p className="slds-timeline__date">
                                    <FormattedDateTime value={ time } type="datetime-short"></FormattedDateTime>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        );
    }
}

TimelineItem.propTypes = {
    className: PropTypes.isString('className'),
    variant: PropTypes.isString('variant').values([
        "task",
        "event",
        "call",
        "email",
        "note",
    ]),
    iconName: PropTypes.isIcon('iconName').defaultValue(props => 'standard:' + props.variant),
    title: PropTypes.isObject('title').required(),
    time: PropTypes.isNumber('time'),
    children: PropTypes.isChildren('children'),
};

TimelineItem.propTypesRest = true;
TimelineItem.displayName = "TimelineItem";
