const SECOND = 1000;
const MINUTE = 60000;
const HOUR = 3600000;
const DAY = HOUR * 24;

const convertDateTime = (dateTime) => {
    if(dateTime){
        const milliseconds = moment(dateTime).toDate().getTime();
        const date = moment(dateTime).startOf('day').valueOf();
        const time = milliseconds - date;
        const formDateTime = {
            date: date,
            time: time,
            datetime: milliseconds,
        };
        return formDateTime;
    } else {
        return (
            {
                date: undefined,
                time: undefined,
                datetime: undefined
            }
        );
    }
};

const toCronExpression = (date) => {
    date = date || new Date();
    return moment(date).format('s m H D MMM ? YYYY').toUpperCase();
};

const toBackendDateValue = (date) => {
    if(date) {
        const convertDate = moment(date).format('YYYY-MM-DD');
        return convertDate;
    } else return null;
};

const toBackendDatetimeValue = datetime => {
    return datetime ? new Date(datetime).toJSON() : null;
};

const formatElapsed = date => {
    let duration = Date.now() - moment(date).toDate().getTime();
    return moment.duration(duration).humanize() + " ago";
};

const getFormattedTime = (value, options = {}) => {
    const hours = _.floor(value / HOUR);
    const minutes = (value - hours * HOUR) / MINUTE;
    if(options.hour_24) {
        return _.padStart(hours, 2, '0') + ":" + _.padStart(minutes, 2, '0');
    }
    else {
        const am = hours >= 12 ? "pm" : "am";
        return (hours > 12 ? hours - 12 : hours) + ":" + _.padStart(minutes, 2, '0') + am;
    }
};

const parseFormattedTime = (value, options = {}) => {
    if(!value) {
        return;
    }

    let hoursStr = null;
    let minutesStr = null;
    let hours = 0;
    let minutes = 0;

    if(!options.hour_24) {
        const am = value.substring(value.length - 2);
        [hoursStr, minutesStr] = _.split(value.substring(0, value.length - 2), ':');
        hours = _.toInteger(hoursStr);
        minutes = _.toInteger(minutesStr);

        if(hours >= 0 && hours <= 12 && minutes >=0 && minutes <= 59) {
            if(am === 'pm' && hours < 12) {
                return (hours + 12) * HOUR + minutes * MINUTE;
            }
            else {
                return hours * HOUR + minutes * MINUTE;
            }
        }
    }
    else {
        [hoursStr, minutesStr] = _.split(value, ':');
        hours = _.toInteger(hoursStr);
        minutes = _.toInteger(minutesStr);

        if(hours >= 0 && hours <= 23 && minutes >=0 && minutes <= 59) {
            return hours * HOUR + minutes * MINUTE;
        }
    }
};

const convertDateRange = range => {
    if(!range) {
        return [null, null];
    }

    let [rangeTypeName, option, val] = _.split(range, '/');
    val = _.toInteger(val);

    if(option === 'prev') {
        return [
            moment().add(-1, rangeTypeName).startOf(rangeTypeName).toDate().getTime(),
            moment().add(-1, rangeTypeName).endOf(rangeTypeName).toDate().getTime(),
        ];
    }
    else if(option === 'this') {
        return [
            moment().startOf(rangeTypeName).toDate().getTime(),
            moment().endOf(rangeTypeName).toDate().getTime(),
        ];
    }
    else if(option === 'next') {
        return [
            moment().add(1, rangeTypeName).startOf(rangeTypeName).toDate().getTime(),
            moment().add(1, rangeTypeName).endOf(rangeTypeName).toDate().getTime(),
        ];
    }
    else if(option === 'last_n') {
        return [
            moment().add(-val, rangeTypeName).startOf(rangeTypeName).toDate().getTime(),
            moment().endOf(rangeTypeName).toDate().getTime(),
        ];
    }
    else if(option === 'next_n') {
        return [
            moment().startOf(rangeTypeName).toDate().getTime(),
            moment().add(val, rangeTypeName).endOf(rangeTypeName).toDate().getTime(),
        ];
    }
    else if(option === 'to_date') {
        return [
            moment().startOf(rangeTypeName).toDate().getTime(),
            moment().endOf('day').toDate().getTime(),
        ];
    }
    else {
        return [null, null];
    }
};

const DateTime = {
    SECOND,
    MINUTE,
    HOUR,
    DAY,

    convertDateTime,
    formatElapsed,
    toBackendDateValue,
    toBackendDatetimeValue,
    getFormattedTime,
    parseFormattedTime,
    toCronExpression,
    convertDateRange,
};

export default DateTime;
