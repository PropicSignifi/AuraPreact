import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Utils from '../utils/utils';
import createLoadingIndicator from '../busyloading/busyloading';

export default class Link extends BaseComponent {
    constructor() {
        super();

        this.state = {
            recordName: null,
        };

        this.$lastRecordId = null;
        this.$indicator = createLoadingIndicator(false);
    }

    componentDidMount() {
        super.componentDidMount();

        this.loadRecordName(this.prop('recordId'));
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        this.loadRecordName(nextProps.recordId);
    }

    loadRecordName(recordId) {
        if(this.$lastRecordId !== recordId) {
            this.$lastRecordId = recordId;
            if(_.isEmpty(this.prop('children'))) {
                this.$indicator.until(
                    window.$ActionService.DataLightningExtension.invoke('getNames', {
                        idList: recordId,
                    }).then(names => {
                        this.setState({
                            recordName: names[0],
                        });
                    })
                );
            }
        }
    }

    onClickLink() {
        const recordId = this.prop('recordId');
        const url = this.prop('url');

        if(recordId) {
            Utils.openSObject(recordId);
        }
        else {
            Utils.openUrl(url);
        }
    }

    render(props, state) {
        const [{
            className,
            title,
            children,
        }, rest] = this.getPropValues();

        const LoadingZone = this.$indicator.Zone;

        if(_.isEmpty(children)) {
            return (
                <LoadingZone className="slds-truncate">
                    <a className={ className } href="javascript:void(0)" title={ title } onClick={ this.onClickLink.bind(this) } data-type={ this.getTypeName() } {...rest}>
                        { this.state.recordName }
                    </a>
                </LoadingZone>
            );
        }
        else {
            return (
                <a className={ className } href="javascript:void(0)" title={ title } onClick={ this.onClickLink.bind(this) } data-type={ this.getTypeName() } {...rest}>
                    { children }
                </a>
            );
        }
    }
}

Link.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    title: PropTypes.isString('title').demoValue('title'),
    recordId: PropTypes.isString('recordId').demoValue('id'),
    url: PropTypes.isString('url'),
    children: PropTypes.isChildren('children'),
};

Link.propTypesRest = true;
Link.displayName = "Link";
