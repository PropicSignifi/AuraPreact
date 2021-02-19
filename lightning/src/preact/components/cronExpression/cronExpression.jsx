import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Input from '../input/input';
import ButtonStateful from '../buttonStateful/buttonStateful';
import Button from '../button/button';
import Tabset from '../tabset/tabset';
import Tab from '../tabset/tab';
import Select from '../select/select';
import TagsInput from '../tagsInput/tagsInput';
import Illustration from '../illustration/illustration';
import ScopedNotification from '../scopedNotification/scopedNotification';
import styles from './styles.less';

const currentYear = moment().get('year');

const fieldNames = [
    'seconds',
    'minutes',
    'hours',
    'dayOfMonth',
    'dayOfWeek',
    'month',
    'year',
];

const isGeneric = value => value === '*' || value === '?';

const canSkipField = (cron, field) => {
    const index = _.indexOf(fieldNames, field);
    if(index > 0) {
        return _.chain(fieldNames)
            .slice(index - 1)
            .every(name => isGeneric(cron[name]))
            .value();
    }
};

const canSkip = (cron, name, hiddenTabs) => {
    if(_.includes(hiddenTabs, name)) {
        return true;
    }

    if(name === 'day') {
        return canSkipField(cron, 'dayOfMonth') && canSkipField(cron, 'dayOfWeek');
    }
    else {
        return canSkipField(cron, name);
    }
};

const generateOptions = (start, end) => {
    return _.range(start, end).map(n => {
        return {
            label: `${n}`,
            value: `${n}`,
        };
    });
};

const capitalize = str => _.toUpper(str.substring(0, 1)) + str.substring(1);

const formatList = (list, format = _.identity) => {
    return _.chain(list)
        .map((item, index) => {
            const formatted = format(item);
            if(index === 0) {
                return formatted;
            }
            else if(index === _.size(list) - 1) {
                return ` and ${formatted}`;
            }
            else {
                return `, ${formatted}`;
            }
        })
        .join('')
        .value();
};

const formatNumber = num => ':' + _.padStart(num, 2, '0');

const formatNumbers = numList => formatList(numList, formatNumber);

const formatHour = hour => `${hour} o'clock`;

const formatHours = numList => formatList(numList, formatHour);

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const weekDayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const findMonthName = value => {
    const monthName = _.find(monthNames, name => _.toUpper(name).startsWith(_.toUpper(value)));
    return monthName ? monthName : monthNames[_.toNumber(value) - 1];
};

const normalizeMonthName = monthName => {
    return _.chain(monthName).slice(0, 3).join('').toUpper().value();
};

const generateNumberMonthOptions = () => {
    return _.times(12, n => {
        return {
            label: monthNames[n],
            value: `${n + 1}`,
        };
    });
};

const generateStringMonthOptions = () => {
    return _.map(monthNames, name => {
        return {
            label: name,
            value: normalizeMonthName(name),
        };
    });
};

const findWeekDayName = value => {
    const weekDayName = _.find(weekDayNames, name => _.toUpper(name).startsWith(_.toUpper(value)));
    return weekDayName ? weekDayName : weekDayNames[_.toNumber(value) - 1];
};

const normalizeWeekDayName = name => {
    return _.chain(name).slice(0, 3).join('').toUpper().value();
};

const generateNumberWeekDayOptions = () => {
    return _.times(7, n => {
        return {
            label: weekDayNames[n],
            value: `${n + 1}`,
        };
    });
};

const generateStringWeekDayOptions = () => {
    return _.map(weekDayNames, name => {
        return {
            label: name,
            value: normalizeWeekDayName(name),
        };
    });
};

const getDayOfMonthSuffix = n => {
    switch(n) {
        case 1:
        case 21:
        case 31:
            return 'st';
        case 2:
        case 22:
            return 'nd';
        case 3:
        case 23:
            return 'rd';
        default:
            return 'th';
    }
};

const getDayName = n => `${n}${getDayOfMonthSuffix(n)}`;

const formatDays = numList => formatList(numList, getDayName);

const formatWeekDays = numList => formatList(numList, findWeekDayName);

const formatMonths = numList => formatList(numList, findMonthName);

const generateDayOfMonthOptions = count => {
    return _.times(count, n => {
        return {
            label: getDayName(n + 1),
            value: `${n + 1}`,
        };
    });
};

const isValidEvery = input => input === '*';
const isValidEveryInterval = input => /^\d+\/\d+$/.test(input);
const isValidSpecific = input => /^\d+(,\d+)*$/.test(input);
const isValidSpecificMonth = input => /^(\d|\w)+(,(\d|\w)+)*$/.test(input);
const isValidSpecificWeekDay = input => /^(\d|\w)+(,(\d|\w)+)*$/.test(input);
const isValidEveryRange = input => /^\d+-\d+$/.test(input);
const isValidLastWeekDayOfMonth = input => /^\d+L$/.test(input);
const isValidLastDaysBeforeMonth = input => /^L-\d+$/.test(input);
const isValidNearestWeekday = input => /^\d+W$/.test(input);
const isValidNthWeekday = input => /^\d+#\d+$/.test(input);

const editorData = [
    {
        name: 'seconds',
        label: 'Seconds',
        choices: [
            {
                name: 'every',
                render: (data, onValueChange) => {
                    return (
                        <div>Every second</div>
                    );
                },
                toCron: data => {
                    return {
                        seconds: '*',
                    };
                },
                fromCron: cron => {
                    return isValidEvery(cron.seconds);
                },
                describe: data => {
                    return 'every second';
                },
            },
            {
                name: 'every_interval',
                defaultValues: {
                    second: 1,
                    startingSecond: 0,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="seconds"
                                label="Seconds"
                                variant="label-removed"
                                options={ generateOptions(1, 61) }
                                value={ data.second }
                                onValueChange={ newVal => onValueChange({ second: newVal }) }
                            >
                            </Select>
                            second(s) starting at second
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingSecond"
                                label="Starting Second"
                                variant="label-removed"
                                options={ generateOptions(0, 60) }
                                value={ data.startingSecond }
                                onValueChange={ newVal => onValueChange({ startingSecond: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        seconds: `${data.startingSecond}/${data.second}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryInterval(cron.seconds)) {
                        const [startingSecond, second] = _.split(cron.seconds, '/');
                        return {
                            startingSecond,
                            second,
                        };
                    }
                },
                describe: data => {
                    return `every ${data.second} second(s) starting at second ${formatNumber(data.startingSecond)}`;
                },
            },
            {
                name: 'specific',
                defaultValues: {
                    specific: [
                        {
                            label: '0',
                            value: '0',
                        },
                    ],
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Specific second(s)
                            <TagsInput
                                className="slds-m-horizontal_x-small"
                                name="seconds"
                                label="Second"
                                variant="label-removed"
                                style="inside"
                                minLetters="1"
                                getTags={ searchText => generateOptions(0, 60) }
                                addTag={ tag => {
                                    const num = _.toNumber(tag.label);
                                    if(num >= 0 && num < 60) {
                                        return {
                                            label: `${num}`,
                                            value: `${num}`,
                                        };
                                    }
                                } }
                                value={ data.specific }
                                onValueChange={ newVal => onValueChange({specific: newVal}) }
                            >
                            </TagsInput>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        seconds: _.chain(data.specific)
                            .map('value')
                            .join(',')
                            .value(),
                    };
                },
                fromCron: cron => {
                    if(isValidSpecific(cron.seconds)) {
                        const seconds = _.split(cron.seconds, ',');
                        return {
                            specific: _.map(seconds, item => {
                                return {
                                    label: item,
                                    value: item,
                                };
                            }),
                        };
                    }
                },
                describe: data => {
                    return `at seconds ${formatNumbers(_.map(data.specific, 'value'))}`;
                },
            },
            {
                name: 'every_range',
                defaultValues: {
                    startingSecond: 0,
                    endingSecond: 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every second between second
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingSecond"
                                label="Starting Second"
                                variant="label-removed"
                                options={ generateOptions(0, 60) }
                                value={ data.startingSecond }
                                onValueChange={ newVal => onValueChange({ startingSecond: newVal }) }
                            >
                            </Select>
                            and second
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="endingSecond"
                                label="Ending Second"
                                variant="label-removed"
                                options={ generateOptions(0, 60) }
                                value={ data.endingSecond }
                                onValueChange={ newVal => onValueChange({ endingSecond: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        seconds: `${data.startingSecond}-${data.endingSecond}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryRange(cron.seconds)) {
                        const [startingSecond, endingSecond] = _.split(cron.seconds, '-');
                        return {
                            startingSecond,
                            endingSecond,
                        };
                    }
                },
                describe: data => {
                    return `every second bewteen ${formatNumber(data.startingSecond)} and ${formatNumber(data.endingSecond)}`;
                },
            },
        ],
    },
    {
        name: 'minutes',
        label: 'Minutes',
        choices: [
            {
                name: 'every',
                render: (data, onValueChange) => {
                    return (
                        <div>Every minute</div>
                    );
                },
                toCron: data => {
                    return {
                        minutes: '*',
                    };
                },
                fromCron: cron => {
                    return isValidEvery(cron.minutes);
                },
                describe: data => {
                    return 'every minute';
                },
            },
            {
                name: 'every_interval',
                defaultValues: {
                    minute: 1,
                    startingMinute: 0,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="minutes"
                                label="Minutes"
                                variant="label-removed"
                                options={ generateOptions(1, 61) }
                                value={ data.minute }
                                onValueChange={ newVal => onValueChange({ minute: newVal }) }
                            >
                            </Select>
                            minute(s) starting at minute
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingMinute"
                                label="Starting Minute"
                                variant="label-removed"
                                options={ generateOptions(0, 60) }
                                value={ data.startingMinute }
                                onValueChange={ newVal => onValueChange({ startingMinute: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        minutes: `${data.startingMinute}/${data.minute}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryInterval(cron.minutes)) {
                        const [startingMinute, minute] = _.split(cron.minutes, '/');
                        return {
                            startingMinute,
                            minute,
                        };
                    }
                },
                describe: data => {
                    return `every ${data.minute} minute(s) starting at minute ${formatNumber(data.startingMinute)}`;
                },
            },
            {
                name: 'specific',
                defaultValues: {
                    specific: [
                        {
                            label: '0',
                            value: '0',
                        },
                    ],
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Specific minute(s)
                            <TagsInput
                                className="slds-m-horizontal_x-small"
                                name="minutes"
                                label="Minute"
                                variant="label-removed"
                                style="inside"
                                minLetters="1"
                                getTags={ searchText => generateOptions(0, 60) }
                                addTag={ tag => {
                                    const num = _.toNumber(tag.label);
                                    if(num >= 0 && num < 60) {
                                        return {
                                            label: `${num}`,
                                            value: `${num}`,
                                        };
                                    }
                                } }
                                value={ data.specific }
                                onValueChange={ newVal => onValueChange({ specific: newVal }) }
                            >
                            </TagsInput>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        minutes: _.chain(data.specific)
                            .map('value')
                            .join(',')
                            .value(),
                    };
                },
                fromCron: cron => {
                    if(isValidSpecific(cron.minutes)) {
                        const minutes = _.split(cron.minutes, ',');
                        return {
                            specific: _.map(minutes, item => {
                                return {
                                    label: item,
                                    value: item,
                                };
                            }),
                        };
                    }
                },
                describe: data => {
                    return `at minutes ${formatNumbers(_.map(data.specific, 'value'))}`;
                },
            },
            {
                name: 'every_range',
                defaultValues: {
                    startingMinute: 0,
                    endingMinute: 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every minute between minute
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingMinute"
                                label="Starting Minute"
                                variant="label-removed"
                                options={ generateOptions(0, 60) }
                                value={ data.startingMinute }
                                onValueChange={ newVal => onValueChange({ startingMinute: newVal }) }
                            >
                            </Select>
                            and minute
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="endingMinute"
                                label="Ending Minute"
                                variant="label-removed"
                                options={ generateOptions(0, 60) }
                                value={ data.endingMinute }
                                onValueChange={ newVal => onValueChange({ endingMinute: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        minutes: `${data.startingMinute}-${data.endingMinute}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryRange(cron.minutes)) {
                        const [startingMinute, endingMinute] = _.split(cron.minutes, '-');
                        return {
                            startingMinute,
                            endingMinute,
                        };
                    }
                },
                describe: data => {
                    return `every minute bewteen ${formatNumber(data.startingMinute)} and ${formatNumber(data.endingMinute)}`;
                },
            },
        ],
    },
    {
        name: 'hours',
        label: 'Hours',
        choices: [
            {
                name: 'every',
                render: (data, onValueChange) => {
                    return (
                        <div>Every hour</div>
                    );
                },
                toCron: data => {
                    return {
                        hours: '*',
                    };
                },
                fromCron: cron => {
                    return isValidEvery(cron.hours);
                },
                describe: data => {
                    return 'every hour';
                },
            },
            {
                name: 'every_interval',
                defaultValues: {
                    hour: 1,
                    startingHour: 0,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="hours"
                                label="Hours"
                                variant="label-removed"
                                options={ generateOptions(1, 25) }
                                value={ data.hour }
                                onValueChange={ newVal => onValueChange({ hour: newVal }) }
                            >
                            </Select>
                            hour(s) starting at hour
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingHour"
                                label="Starting Hour"
                                variant="label-removed"
                                options={ generateOptions(0, 24) }
                                value={ data.startingHour }
                                onValueChange={ newVal => onValueChange({ startingHour: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        hours: `${data.startingHour}/${data.hour}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryInterval(cron.hours)) {
                        const [startingHour, hour] = _.split(cron.hours, '/');
                        return {
                            startingHour,
                            hour,
                        };
                    }
                },
                describe: data => {
                    return `every ${data.hour} hour(s) starting at ${formatHour(data.startingHour)}`;
                },
            },
            {
                name: 'specific',
                defaultValues: {
                    specific: [
                        {
                            label: '0',
                            value: '0',
                        },
                    ],
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Specific hour(s)
                            <TagsInput
                                className="slds-m-horizontal_x-small"
                                name="hours"
                                label="Hour"
                                variant="label-removed"
                                style="inside"
                                minLetters="1"
                                getTags={ searchText => generateOptions(0, 24) }
                                addTag={ tag => {
                                    const num = _.toNumber(tag.label);
                                    if(num >= 0 && num < 24) {
                                        return {
                                            label: `${num}`,
                                            value: `${num}`,
                                        };
                                    }
                                } }
                                value={ data.specific }
                                onValueChange={ newVal => onValueChange({ specific: newVal }) }
                            >
                            </TagsInput>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        hours: _.chain(data.specific)
                            .map('value')
                            .join(',')
                            .value(),
                    };
                },
                fromCron: cron => {
                    if(isValidSpecific(cron.hours)) {
                        const hours = _.split(cron.hours, ',');
                        return {
                            specific: _.map(hours, item => {
                                return {
                                    label: item,
                                    value: item,
                                };
                            }),
                        };
                    }
                },
                describe: data => {
                    return `at ${formatHours(_.map(data.specific, 'value'))}`;
                },
            },
            {
                name: 'every_range',
                defaultValues: {
                    startingHour: 0,
                    endingHour: 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every hour between hour
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingHour"
                                label="Starting Hour"
                                variant="label-removed"
                                options={ generateOptions(0, 24) }
                                value={ data.startingHour }
                                onValueChange={ newVal => onValueChange({ startingHour: newVal }) }
                            >
                            </Select>
                            and hour
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="endingHour"
                                label="Ending Hour"
                                variant="label-removed"
                                options={ generateOptions(0, 24) }
                                value={ data.endingHour }
                                onValueChange={ newVal => onValueChange({ endingHour: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        hours: `${data.startingHour}-${data.endingHour}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryRange(cron.hours)) {
                        const [startingHour, endingHour] = _.split(cron.hours, '-');
                        return {
                            startingHour,
                            endingHour,
                        };
                    }
                },
                describe: data => {
                    return `every hour bewteen ${formatHour(data.startingHour)} and ${formatHour(data.endingHour)}`;
                },
            },
        ],
    },
    {
        name: 'day',
        label: 'Day',
        choices: [
            {
                name: 'every',
                render: (data, onValueChange) => {
                    return (
                        <div>Every day</div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: '?',
                        dayOfWeek: '*',
                    };
                },
                fromCron: cron => {
                    return (cron.dayOfMonth === '?' && cron.dayOfWeek === '*') ||
                        (cron.dayOfMonth === '*' && cron.dayOfWeek === '?');
                },
                describe: data => {
                    return 'every day';
                },
            },
            {
                name: 'every_interval',
                defaultValues: {
                    day: 1,
                    startingDayOfMonth: 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="day"
                                label="Day"
                                variant="label-removed"
                                options={ generateOptions(1, 32) }
                                value={ data.day }
                                onValueChange={ newVal => onValueChange({ day: newVal }) }
                            >
                            </Select>
                            day(s) starting on the
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingDayOfMonth"
                                label="Starting DayOfMonth"
                                variant="label-removed"
                                options={ generateDayOfMonthOptions(31) }
                                value={ data.startingDayOfMonth }
                                onValueChange={ newVal => onValueChange({ startingDayOfMonth: newVal }) }
                            >
                            </Select>
                            of the month
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: `${data.startingDayOfMonth}/${data.day}`,
                        dayOfWeek: '?',
                    };
                },
                fromCron: cron => {
                    if(isValidEveryInterval(cron.dayOfMonth) && cron.dayOfWeek === '?') {
                        const [startingDayOfMonth, day] = _.split(cron.dayOfMonth, '/');
                        return {
                            startingDayOfMonth,
                            day,
                        };
                    }
                },
                describe: data => {
                    return `every ${data.day} day(s) starting on the ${getDayName(data.startingDayOfMonth)}`;
                },
            },
            {
                name: 'every_interval_of_week',
                defaultValues: {
                    day: 1,
                    startingDayOfWeek: 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="day"
                                label="Day"
                                variant="label-removed"
                                options={ generateOptions(1, 8) }
                                value={ data.day }
                                onValueChange={ newVal => onValueChange({ day: newVal }) }
                            >
                            </Select>
                            day(s) starting on
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingDayOfWeek"
                                label="Starting DayOfWeek"
                                variant="label-removed"
                                options={ generateNumberWeekDayOptions() }
                                value={ data.startingDayOfWeek }
                                onValueChange={ newVal => onValueChange({ startingDayOfWeek: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: '?',
                        dayOfWeek: `${data.startingDayOfWeek}/${data.day}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryInterval(cron.dayOfWeek) && cron.dayOfMonth === '?') {
                        const [startingDayOfWeek, day] = _.split(cron.dayOfWeek, '/');
                        return {
                            startingDayOfWeek,
                            day,
                        };
                    }
                },
                describe: data => {
                    return `every ${data.day} day(s) starting on ${findWeekDayName(data.startingDayOfWeek)}`;
                },
            },
            {
                name: 'specific',
                defaultValues: {
                    specific: [
                        {
                            label: '1',
                            value: '1',
                        },
                    ],
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Specific day(s) of month
                            <TagsInput
                                className="slds-m-horizontal_x-small"
                                name="day"
                                label="Day"
                                variant="label-removed"
                                style="inside"
                                minLetters="1"
                                getTags={ searchText => generateOptions(1, 32) }
                                addTag={ tag => {
                                    const num = _.toNumber(tag.label);
                                    if(num >= 1 && num < 32) {
                                        return {
                                            label: `${num}`,
                                            value: `${num}`,
                                        };
                                    }
                                } }
                                value={ data.specific }
                                onValueChange={ newVal => onValueChange({specific: newVal}) }
                            >
                            </TagsInput>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: _.chain(data.specific)
                            .map('value')
                            .join(',')
                            .value(),
                        dayOfWeek: '?',
                    };
                },
                fromCron: cron => {
                    if(isValidSpecific(cron.dayOfMonth) && cron.dayOfWeek === '?') {
                        const dayOfMonth = _.split(cron.dayOfMonth, ',');
                        return {
                            specific: _.map(dayOfMonth, item => {
                                return {
                                    label: item,
                                    value: item,
                                };
                            }),
                        };
                    }
                },
                describe: data => {
                    return `on the ${formatDays(_.map(data.specific, 'value'))} day(s)`;
                },
            },
            {
                name: 'specific_of_week',
                defaultValues: {
                    specific: [
                        {
                            label: 'Sunday',
                            value: 'SUN',
                        },
                    ],
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Specific day(s) of week
                            <TagsInput
                                className="slds-m-horizontal_x-small"
                                name="day"
                                label="Day"
                                variant="label-removed"
                                style="inside"
                                minLetters="1"
                                getTags={ searchText => generateStringWeekDayOptions() }
                                addTag={ tag => {
                                    const weekDayName = findWeekDayName(tag.label);
                                    if(weekDayName) {
                                        return {
                                            label: weekDayName,
                                            value: normalizeWeekDayName(weekDayName),
                                        };
                                    }
                                } }
                                value={ data.specific }
                                onValueChange={ newVal => onValueChange({specific: newVal}) }
                            >
                            </TagsInput>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfWeek: _.chain(data.specific)
                            .map('value')
                            .join(',')
                            .value(),
                        dayOfMonth: '?',
                    };
                },
                fromCron: cron => {
                    if(isValidSpecificWeekDay(cron.dayOfWeek) && cron.dayOfMonth === '?') {
                        const dayOfWeek = _.split(cron.dayOfWeek, ',');
                        return {
                            specific: _.map(dayOfWeek, item => {
                                const weekDayName = findWeekDayName(item);
                                return {
                                    label: weekDayName,
                                    value: item,
                                };
                            }),
                        };
                    }
                },
                describe: data => {
                    return `on every ${formatWeekDays(_.map(data.specific, 'value'))}`;
                },
            },
            {
                name: 'every_range',
                defaultValues: {
                    startingDayOfMonth: 1,
                    endingDayOfMonth: 2,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every day of month between
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingDayOfMonth"
                                label="Starting DayOfMonth"
                                variant="label-removed"
                                options={ generateDayOfMonthOptions(31) }
                                value={ data.startingDayOfMonth }
                                onValueChange={ newVal => onValueChange({ startingDayOfMonth: newVal }) }
                            >
                            </Select>
                            and
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="endingDayOfMonth"
                                label="Ending DayOfMonth"
                                variant="label-removed"
                                options={ generateDayOfMonthOptions(31) }
                                value={ data.endingDayOfMonth }
                                onValueChange={ newVal => onValueChange({ endingDayOfMonth: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: `${data.startingDayOfMonth}-${data.endingDayOfMonth}`,
                        dayOfWeek: '?',
                    };
                },
                fromCron: cron => {
                    if(isValidEveryRange(cron.dayOfMonth) && cron.dayOfWeek === '?') {
                        const [startingDayOfMonth, endingDayOfMonth] = _.split(cron.dayOfMonth, '-');
                        return {
                            startingDayOfMonth,
                            endingDayOfMonth,
                        };
                    }
                },
                describe: data => {
                    return `every day bewteen ${getDayName(data.startingDayOfMonth)} and ${getDayName(data.endingDayOfMonth)}`;
                },
            },
            {
                name: 'last_day',
                render: (data, onValueChange) => {
                    return (
                        <div>On the last day of the month</div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: 'L',
                        dayOfWeek: '?',
                    };
                },
                fromCron: cron => {
                    return cron.dayOfMonth === 'L' && cron.dayOfWeek === '?';
                },
                describe: data => {
                    return `on the last day of the month`;
                },
            },
            {
                name: 'last_weekday',
                render: (data, onValueChange) => {
                    return (
                        <div>On the last weekday of the month</div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: 'LW',
                        dayOfWeek: '?',
                    };
                },
                fromCron: cron => {
                    return cron.dayOfMonth === 'LW' && cron.dayOfWeek === '?';
                },
                describe: data => {
                    return `on the last weekday of the month`;
                },
            },
            {
                name: 'last_weekday_of_month',
                defaultValues: {
                    lastDayOfWeek: 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            On the last
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="lastDayOfWeek"
                                label="Last DayOfWeek"
                                variant="label-removed"
                                options={ generateNumberWeekDayOptions() }
                                value={ data.lastDayOfWeek }
                                onValueChange={ newVal => onValueChange({ lastDayOfWeek: newVal }) }
                            >
                            </Select>
                            of the month
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: '?',
                        dayOfWeek: `${data.lastDayOfWeek}L`,
                    };
                },
                fromCron: cron => {
                    if(isValidLastWeekDayOfMonth(cron.dayOfWeek) && cron.dayOfMonth === '?') {
                        const lastDayOfWeek = _.trimEnd(cron.dayOfWeek, 'L');
                        return {
                            lastDayOfWeek,
                        };
                    }
                },
                describe: data => {
                    return `on the last ${findWeekDayName(data.lastDayOfWeek)} of the month`;
                },
            },
            {
                name: 'days_before_month',
                defaultValues: {
                    daysBeforeMonth: 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            <Select
                                className="slds-m-right_x-small"
                                name="day"
                                label="Day"
                                variant="label-removed"
                                options={ generateOptions(1, 32) }
                                value={ data.daysBeforeMonth }
                                onValueChange={ newVal => onValueChange({ daysBeforeMonth: newVal }) }
                            >
                            </Select>
                            day(s) before the end of the month
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: `L-${data.daysBeforeMonth}`,
                        dayOfWeek: '?',
                    };
                },
                fromCron: cron => {
                    if(isValidLastDaysBeforeMonth(cron.dayOfMonth) && cron.dayOfWeek === '?') {
                        const daysBeforeMonth = _.trimStart(cron.dayOfMonth, 'L-');
                        return {
                            daysBeforeMonth,
                        };
                    }
                },
                describe: data => {
                    return `${data.daysBeforeMonth} day(s) before the end of the month`;
                },
            },
            {
                name: 'nearest_weekday',
                defaultValues: {
                    nearestWeekday: 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Nearest weekday (Monday to Friday) to the
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="nearestWeekday"
                                label="Nearest Weekday"
                                variant="label-removed"
                                options={ generateDayOfMonthOptions(31) }
                                value={ data.nearestWeekday }
                                onValueChange={ newVal => onValueChange({ nearestWeekday: newVal }) }
                            >
                            </Select>
                            of the month
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: `${data.nearestWeekday}W`,
                        dayOfWeek: '?',
                    };
                },
                fromCron: cron => {
                    if(isValidNearestWeekday(cron.dayOfMonth) && cron.dayOfWeek === '?') {
                        const nearestWeekday = _.trimEnd(cron.dayOfMonth, 'W');
                        return {
                            nearestWeekday,
                        };
                    }
                },
                describe: data => {
                    return `on the nearest weekday to the ${getDayName(data.nearestWeekday)} of the month`;
                },
            },
            {
                name: 'on_weekday_of_month',
                defaultValues: {
                    nth: 1,
                    nthDayOfWeek: 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            On the
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="day"
                                label="Day"
                                variant="label-removed"
                                options={ generateDayOfMonthOptions(5) }
                                value={ data.nth }
                                onValueChange={ newVal => onValueChange({ nth: newVal }) }
                            >
                            </Select>
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="nthDayOfWeek"
                                label="Nth DayOfWeek"
                                variant="label-removed"
                                options={ generateNumberWeekDayOptions() }
                                value={ data.nthDayOfWeek }
                                onValueChange={ newVal => onValueChange({ nthDayOfWeek: newVal }) }
                            >
                            </Select>
                            of the month
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        dayOfMonth: '?',
                        dayOfWeek: `${data.nthDayOfWeek}#${data.nth}`,
                    };
                },
                fromCron: cron => {
                    if(isValidNthWeekday(cron.dayOfWeek) && cron.dayOfMonth === '?') {
                        const [nthDayOfWeek, nth] = _.split(cron.dayOfWeek, '#');
                        return {
                            nthDayOfWeek,
                            nth,
                        };
                    }
                },
                describe: data => {
                    return `on the ${getDayName(data.nth)} ${findWeekDayName(data.nthDayOfWeek)} of the month`;
                },
            },
        ],
    },
    {
        name: 'month',
        label: 'Month',
        choices: [
            {
                name: 'every',
                render: (data, onValueChange) => {
                    return (
                        <div>Every month</div>
                    );
                },
                toCron: data => {
                    return {
                        month: '*',
                    };
                },
                fromCron: cron => {
                    return isValidEvery(cron.month);
                },
                describe: data => {
                    return 'every month';
                },
            },
            {
                name: 'every_interval',
                defaultValues: {
                    month: 1,
                    startingMonth: 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="month"
                                label="Month"
                                variant="label-removed"
                                options={ generateOptions(1, 13) }
                                value={ data.month }
                                onValueChange={ newVal => onValueChange({ month: newVal }) }
                            >
                            </Select>
                            month(s) starting in
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingMonth"
                                label="Starting Month"
                                variant="label-removed"
                                options={ generateNumberMonthOptions() }
                                value={ data.startingMonth }
                                onValueChange={ newVal => onValueChange({ startingMonth: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        month: `${data.startingMonth}/${data.month}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryInterval(cron.month)) {
                        const [startingMonth, month] = _.split(cron.month, '/');
                        return {
                            startingMonth,
                            month,
                        };
                    }
                },
                describe: data => {
                    return `every ${data.month} month(s) starting in ${findMonthName(data.startingMonth)}`;
                },
            },
            {
                name: 'specific',
                defaultValues: {
                    specific: [
                        {
                            label: 'January',
                            value: 'JAN',
                        },
                    ],
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Specific month(s)
                            <TagsInput
                                className="slds-m-horizontal_x-small"
                                name="month"
                                label="Month"
                                variant="label-removed"
                                style="inside"
                                minLetters="1"
                                getTags={ searchText => generateStringMonthOptions() }
                                addTag={ tag => {
                                    const monthName = findMonthName(tag.label);
                                    if(monthName) {
                                        return {
                                            label: monthName,
                                            value: normalizeMonthName(monthName),
                                        };
                                    }
                                } }
                                value={ data.specific }
                                onValueChange={ newVal => onValueChange({ specific: newVal }) }
                            >
                            </TagsInput>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        month: _.chain(data.specific)
                            .map('value')
                            .join(',')
                            .value(),
                    };
                },
                fromCron: cron => {
                    if(isValidSpecificMonth(cron.month)) {
                        const month = _.split(cron.month, ',');
                        return {
                            specific: _.map(month, item => {
                                const monthName = findMonthName(item);
                                return {
                                    label: monthName,
                                    value: item,
                                };
                            }),
                        };
                    }
                },
                describe: data => {
                    return `in ${formatMonths(_.map(data.specific, 'value'))}`;
                },
            },
            {
                name: 'every_range',
                defaultValues: {
                    startingMonth: 1,
                    endingMonth: 2,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every month between
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingMonth"
                                label="Starting Month"
                                variant="label-removed"
                                options={ generateNumberMonthOptions() }
                                value={ data.startingMonth }
                                onValueChange={ newVal => onValueChange({ startingMonth: newVal }) }
                            >
                            </Select>
                            and
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="endingMonth"
                                label="Ending Month"
                                variant="label-removed"
                                options={ generateNumberMonthOptions() }
                                value={ data.endingMonth }
                                onValueChange={ newVal => onValueChange({ endingMonth: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        month: `${data.startingMonth}-${data.endingMonth}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryRange(cron.month)) {
                        const [startingMonth, endingMonth] = _.split(cron.month, '-');
                        return {
                            startingMonth,
                            endingMonth,
                        };
                    }
                },
                describe: data => {
                    return `every month bewteen ${findMonthName(data.startingMonth)} and ${findMonthName(data.endingMonth)}`;
                },
            },
        ],
    },
    {
        name: 'year',
        label: 'Year',
        choices: [
            {
                name: 'every',
                render: (data, onValueChange) => {
                    return (
                        <div>Every year</div>
                    );
                },
                toCron: data => {
                    return {
                        year: '*',
                    };
                },
                fromCron: cron => {
                    return isValidEvery(cron.year);
                },
                describe: data => {
                    return 'every year';
                },
            },
            {
                name: 'every_interval',
                defaultValues: {
                    year: 1,
                    startingYear: currentYear,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="year"
                                label="Year"
                                variant="label-removed"
                                options={ generateOptions(1, 51) }
                                value={ data.year }
                                onValueChange={ newVal => onValueChange({ year: newVal }) }
                            >
                            </Select>
                            year(s) starting in
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingYear"
                                label="Starting Year"
                                variant="label-removed"
                                options={ generateOptions(2000, 2100) }
                                value={ data.startingYear }
                                onValueChange={ newVal => onValueChange({ startingYear: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        year: `${data.startingYear}/${data.year}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryInterval(cron.year)) {
                        const [startingYear, year] = _.split(cron.year, '/');
                        return {
                            startingYear,
                            year,
                        };
                    }
                },
                describe: data => {
                    return `every ${data.year} year(s) starting in ${data.startingYear}`;
                },
            },
            {
                name: 'specific',
                defaultValues: {
                    specific: [
                        {
                            label: `${currentYear}`,
                            value: `${currentYear}`,
                        },
                    ],
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Specific year(s)
                            <TagsInput
                                className="slds-m-horizontal_x-small"
                                name="year"
                                label="Year"
                                variant="label-removed"
                                style="inside"
                                minLetters="1"
                                getTags={ searchText => generateOptions(2000, 2100) }
                                addTag={ tag => {
                                    const num = _.toNumber(tag.label);
                                    if(num >= 2000 && num < 2100) {
                                        return {
                                            label: `${num}`,
                                            value: `${num}`,
                                        };
                                    }
                                } }
                                value={ data.specific }
                                onValueChange={ newVal => onValueChange({ specific: newVal }) }
                            >
                            </TagsInput>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        year: _.chain(data.specific)
                            .map('value')
                            .join(',')
                            .value(),
                    };
                },
                fromCron: cron => {
                    if(isValidSpecific(cron.year)) {
                        const year = _.split(cron.year, ',');
                        return {
                            specific: _.map(year, item => {
                                return {
                                    label: item,
                                    value: item,
                                };
                            }),
                        };
                    }
                },
                describe: data => {
                    return `in ${formatList(_.map(data.specific, 'value'))}`;
                },
            },
            {
                name: 'every_range',
                defaultValues: {
                    startingYear: currentYear,
                    endingYear: currentYear + 1,
                },
                render: (data, onValueChange) => {
                    return (
                        <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                            Every year between
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="startingYear"
                                label="Starting Year"
                                variant="label-removed"
                                options={ generateOptions(2000, 2100) }
                                value={ data.startingYear }
                                onValueChange={ newVal => onValueChange({ startingYear: newVal }) }
                            >
                            </Select>
                            and
                            <Select
                                className="slds-m-horizontal_x-small"
                                name="endingYear"
                                label="Ending Year"
                                variant="label-removed"
                                options={ generateOptions(2000, 2100) }
                                value={ data.endingYear }
                                onValueChange={ newVal => onValueChange({ endingYear: newVal }) }
                            >
                            </Select>
                        </div>
                    );
                },
                toCron: data => {
                    return {
                        year: `${data.startingYear}-${data.endingYear}`,
                    };
                },
                fromCron: cron => {
                    if(isValidEveryRange(cron.year)) {
                        const [startingYear, endingYear] = _.split(cron.year, '-');
                        return {
                            startingYear,
                            endingYear,
                        };
                    }
                },
                describe: data => {
                    return `every year bewteen ${data.startingYear} and ${data.endingYear}`;
                },
            },
        ],
    },
];

const parseCronExpression = cron => {
    const [
        seconds,
        minutes,
        hours,
        dayOfMonth,
        month,
        dayOfWeek,
        year,
    ] = _.split(cron, ' ');

    return {
        seconds,
        minutes,
        hours,
        dayOfMonth,
        month,
        dayOfWeek,
        year,
    };
};

const formatCronExpression = ({
    seconds,
    minutes,
    hours,
    dayOfMonth,
    month,
    dayOfWeek,
    year,
}) => {
    return `${seconds || '*'} ${minutes || '*'} ${hours || '*'} ${dayOfMonth || '?'} ${month || '*'} ${dayOfWeek || '*'} ${year || '*'}`;
};

export default class CronExpression extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            showCronEditor: false,
            selectedTabId: null,
            data: {},
            radioGroups: {},
            noPreview: false,
        });
    }

    getAvailableChoices(item) {
        const choices = this.prop('choices');
        if(!_.isEmpty(choices)) {
            return _.chain(item.choices)
                .filter(choice => _.includes(choices, choice.name))
                .value();
        }
        else {
            return item.choices;
        }
    }

    onSwitchingCronEditor(newVal) {
        if(newVal) {
            const value = this.prop('value') || '* * * ? * * *';
            const cron = parseCronExpression(value);
            const newState = {
                noPreview: false,
                radioGroups: this.state.radioGroups,
            };

            _.forEachRight(editorData, item => {
                const choices = this.getAvailableChoices(item);
                if(!_.isEmpty(choices)) {
                    const choice = _.find(choices, c => !!c.fromCron(cron));
                    if(choice) {
                        const changes = choice.fromCron(cron);
                        _.assign(newState.radioGroups, {
                            [item.name]: choice.name,
                        });
                        const path = `${item.name}-${choice.name}`;
                        _.assign(newState, {
                            [path]: changes,
                        });
                    }
                    else {
                        _.assign(newState, {
                            noPreview: true,
                        });
                    }
                }
            });

            this.setState(_.assign(newState, {
                showCronEditor: newVal,
            }));
        }
        else {
            this.setState({
                showCronEditor: newVal,
            });
        }
    }

    onTabSelected(newVal) {
        this.setState({
            selectedTabId: newVal,
        });
    }

    onCancelEditor() {
        this.setState({
            showCronEditor: false,
        });
    }

    getChoiceData(item, choice) {
        const path = `${item.name}-${choice.name}`;
        return _.assign({}, choice.defaultValues, this.state[path]);
    }

    onSaveEditor() {
        const cron = {};

        _.forEachRight(editorData, item => {
            const radioGroupValue = this.state.radioGroups[item.name];
            const choice = _.find(this.getAvailableChoices(item), ['name', radioGroupValue]);
            if(choice) {
                const data = this.getChoiceData(item, choice);
                const changes = choice.toCron(data);
                _.assign(cron, changes);
            }
        });

        this.setState({
            showCronEditor: false,
        }, () => {
            const cronExpression = formatCronExpression(cron);
            this.setValue(cronExpression);
        });
    }

    getSelectedTabId() {
        if(this.state.selectedTabId) {
            return this.state.selectedTabId;
        }
        else {
            const hiddenTabs = this.prop('hiddenTabs');
            return _.chain(editorData)
                .map('name')
                .filter(name => !_.includes(hiddenTabs, name))
                .first()
                .value();
        }
    }

    renderTab(item) {
        const hiddenTabs = this.prop('hiddenTabs');
        if(_.includes(hiddenTabs, item.name)) {
            return null;
        }

        return (
            <Tab
                id={ item.name }
                label={ item.label }
            >
                <div className="slds-grid slds-grid_vertical">
                    {
                        _.map(this.getAvailableChoices(item), this.renderChoice.bind(this, item))
                    }
                </div>
            </Tab>
        );
    }

    onRadioGroupChange(radioGroupName, newVal) {
        this.setState({
            radioGroups: _.assign({}, this.state.radioGroups, {
                [radioGroupName]: newVal,
            }),
        });
    }

    onChoiceDataChange(path, changes) {
        this.setState({
            [path]: _.assign({}, this.state[path], changes),
        });
    }

    renderChoice(item, choice) {
        const path = `${item.name}-${choice.name}`;
        const id = `${this.id()}-${path}`;
        const data = this.getChoiceData(item, choice);
        const onValueChange = newVal => this.onChoiceDataChange(path, newVal);

        const hiddenChoices = this.prop('hiddenChoices');
        if(_.includes(hiddenChoices, `${item.name}:${choice.name}`)) {
            return null;
        }

        return (
            <div className="slds-grid slds-grid_vertical-align-center slds-m-around_small">
                <input
                    id={ id }
                    name={ item.name }
                    type="radio"
                    value={ choice.name }
                    checked={ this.state.radioGroups[item.name] === choice.name }
                    onchange={ this.onRadioGroupChange.bind(this, item.name, choice.name) }
                >
                </input>
                <label className="slds-m-left_small" htmlFor={ id }>
                    { choice.render(data, onValueChange) }
                </label>
            </div>
        );
    }

    describeCronExpression() {
        const descriptions = [];
        const cron = {};

        _.forEachRight(editorData, item => {
            const radioGroupValue = this.state.radioGroups[item.name];
            const choice = _.find(this.getAvailableChoices(item), ['name', radioGroupValue]);
            if(choice) {
                const data = this.getChoiceData(item, choice);
                const changes = choice.toCron(data);
                _.assign(cron, changes);
            }
        });

        _.forEach(editorData, item => {
            const radioGroupValue = this.state.radioGroups[item.name];
            const choice = _.find(this.getAvailableChoices(item), ['name', radioGroupValue]);
            if(choice && _.isFunction(choice.describe)) {
                if(!canSkip(cron, item.name, this.prop('hiddenTabs'))) {
                    const data = this.getChoiceData(item, choice);
                    const description = choice.describe(data);
                    descriptions.push(description);
                }
            }
        });

        return capitalize(_.join(descriptions, ', '));
    }

    renderField(props, state, variables) {
        const [{
            className,
            tooltip,
            name,
            label,
            value,
            variant,
            required,
            onValueChange,
            placeholder,
            ...restProps,
        }, rest] = this.getPropValues();

        return (
            <div className={ `${styles.cronExpression} ${className}` }>
                <div className="slds-grid">
                    <Input
                        { ...restProps }
                        { ...rest }
                        className="slds-col"
                        name={ `${name}-input` }
                        label={ `${label} Input` }
                        variant="label-removed"
                        tooltip={ tooltip }
                        required={ required }
                        disabled={ variables.isDisabled || this.state.showCronEditor }
                        readonly={ variables.isReadonly || this.state.showCronEditor }
                        placeholder={ placeholder || '* * * ? * * *' }
                        value={ value }
                        onValueChange={ onValueChange }
                    >
                    </Input>
                    <ButtonStateful
                        className="slds-m-left_xx-small"
                        state={ this.state.showCronEditor }
                        labelWhenOn="Hide Editor"
                        labelWhenOff="Show Editor"
                        onClick={ this.onSwitchingCronEditor.bind(this) }
                    >
                    </ButtonStateful>
                </div>
                <div className={ window.$Utils.classnames(
                    'slds-box slds-m-top_x-small slds-theme_shade',
                    {
                        'slds-hide': !this.state.showCronEditor,
                    }
                    ) }>
                    {
                        !this.state.noPreview && (
                        <ScopedNotification>
                            <div className="slds-text-color_success">
                                { this.describeCronExpression() }
                            </div>
                        </ScopedNotification>
                        )
                    }
                    <Tabset
                        className={ window.$Utils.classnames(
                        {
                            'slds-hide': this.state.noPreview,
                        }
                        ) }
                        variant="scoped"
                        selectedTabId={ this.getSelectedTabId() }
                        onSelect={ this.onTabSelected.bind(this) }
                    >
                        {
                            _.map(editorData, this.renderTab.bind(this))
                        }
                    </Tabset>
                    {
                        this.state.noPreview && (
                        <Illustration
                            className={ `slds-m-around_medium ${styles.noPreview}` }
                            type="no_preview"
                            title="Preview is Not Available"
                            variant="small"
                        >
                        </Illustration>
                        )
                    }
                    <div className="slds-grid slds-m-top_x-small">
                        <Button
                            className="slds-col_bump-left"
                            variant="tertiary"
                            label="Cancel"
                            onClick={ this.onCancelEditor.bind(this) }
                        >
                        </Button>
                        {
                            !this.state.noPreview && (
                            <Button
                                variant="save"
                                label="Save"
                                disabled={ variables.isDisabled }
                                onClick={ this.onSaveEditor.bind(this) }
                            >
                            </Button>
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}

CronExpression.propTypes = PropTypes.extend(AbstractField.propTypes, {
    value: PropTypes.isString('value'),
    choices: PropTypes.isArray('choices'),
    hiddenTabs: PropTypes.isString('hiddenTabs').defaultValue('').demoValue('').description('Set hidden tabs like "seconds,minutes"'),
    hiddenChoices: PropTypes.isString('hiddenChoices').defaultValue('').demoValue('').description('Set hidden choices like "seconds:every,minutes:every"'),
});

CronExpression.propTypes.name.demoValue('cronExpression');
CronExpression.propTypes.label.demoValue('CronExpression');

CronExpression.propTypesRest = true;
CronExpression.displayName = "CronExpression";
