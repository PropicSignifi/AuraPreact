import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Utils from '../utils/utils';

export default class AbstractPopupField extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            prompted: false,
            popupStyle: {},
        });

        this.$requestingPopup = false;
    }

    isPrompted() {
        return this.state.prompted && !window.$Utils.isNonDesktopBrowser();
    }

    setMainInput(node) {
        this.$popupInput = node;
    }

    setPopupSource(id) {
        this.$popupId = id;
    }

    adjustPopupPosition() {
        if(!this.isPrompted()) {
            return;
        }
        const elem = this.$popupInput;
        if(!elem) {
            return;
        }
        const pos = window.$Utils.getPositionFromBody(elem);
        const popupStyle = {
            position: "absolute",
            left: pos.left + "px",
            right: pos.right + "px",
            top: pos.top + elem.getBoundingClientRect().height + "px",
        };

        if(this.prop('popupDirection') === 'top') {
            popupStyle.transform = 'translate(0px, calc(-100% - 34px))';
        }

        this.setState({
            popupStyle,
        });
    }

    onFocus(e) {
        this.promptPopup();
    }

    onBlur(e) {
        _.delay(() => {
            this.setState({
                prompted: false,
            });
        }, 100);
    }

    promptPopup() {
        this.$requestingPopup = true;
        this.setState({
            prompted: true,
        }, () => this.adjustPopupPosition());
        Utils.delay(() => {
            this.$requestingPopup = false;
        }, 50);
    }

    onClickOutside(e) {
        if(this.isPrompted()) {
            const isInside = window.$Utils.findFromEvent(e, "data-popup-source") === this.$popupId;
            if(!isInside && !this.$requestingPopup) {
                this.setState({
                    prompted: false,
                });
            }
        }
    }

    componentDidMount() {
        super.componentDidMount();

        window.addEventListener("click", this.onClickOutside.bind(this));
        window.addEventListener("resize", this.adjustPopupPosition.bind(this), false);
        window.addEventListener("scroll", this.adjustPopupPosition.bind(this), true);
        window.addEventListener("touchmove", this.adjustPopupPosition.bind(this), true);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        window.removeEventListener("click", this.onClickOutside.bind(this));
        window.removeEventListener("resize", this.adjustPopupPosition.bind(this), false);
        window.removeEventListener("scroll", this.adjustPopupPosition.bind(this), true);
        window.removeEventListener("touchmove", this.adjustPopupPosition.bind(this), true);
    }
}

AbstractPopupField.propTypes = PropTypes.extend(AbstractField.propTypes, {
    popupClass: PropTypes.isString('popupClass').demoValue(''),
    popupDirection: PropTypes.isString('popupDirection').values(['bottom', 'top']).defaultValue('bottom'),
});

AbstractPopupField.displayName = "AbstractPopupField";
