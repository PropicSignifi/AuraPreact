import { h, render, Component } from 'preact';
import Spinner from '../spinner/spinner';

class LoadingIndicator {
    constructor(val) {
        this.val = val;
        this.listeners = [];
    }

    getValue() {
        return this.val;
    }

    setValue(newVal) {
        const oldVal = this.val;
        this.val = newVal;

        this.fireChangeEvent(oldVal, newVal);
    }

    start() {
        this.setValue(true);
    }

    stop() {
        this.setValue(false);
    }

    until(promise) {
        if(promise && _.isFunction(promise.then)) {
            this.start();
            return promise.then(data => {
                this.stop();
                return data;
            }, () => this.stop());
        }
    }

    addChangeListener(listener) {
        this.listeners.push(listener);

        return () => {
            _.pull(this.listeners, listener);
        };
    }

    fireChangeEvent(oldVal, newVal) {
        _.forEach(this.listeners, listener => {
            if(_.isFunction(listener)) {
                listener(oldVal, newVal);
            }
        });
    }
}

const createLoadingIndicator = val => {
    const indicator = new LoadingIndicator(val);

    indicator.Zone = props => {
        return (
            <LoadingZone
                indicator={ indicator }
                { ...props }
            >
                { props.children }
            </LoadingZone>
        );
    };

    return indicator;
};

export default createLoadingIndicator;

class LoadingZone extends Component {
    constructor() {
        super();

        this.state = {
            loading: false,
        };

        this.removeChangeListener = null;
    }

    componentDidMount() {
        const indicator = this.props.indicator;
        if(indicator) {
            this.removeChangeListener = indicator.addChangeListener((oldVal, newVal) => {
                this.setState({
                    loading: newVal,
                });
            });
        }
    }

    componentWillUnmount() {
        this.removeChangeListener && this.removeChangeListener();
    }

    render(props, state) {
        const style = {};
        if(props.height) {
            style.height = props.height;
        }
        else if(props.minHeight) {
            style.minHeight = props.minHeight;
        }

        return (
            <div className={ `slds-is-relative ${props.className}` } style={ style }>
                {
                    this.state.loading && <Spinner></Spinner>
                }
                { props.children }
            </div>
        );
    }
}
