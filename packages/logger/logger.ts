import { blue, red, yellow } from 'chalk';
import moment from 'moment';

const CONFIG = {
    datePattern: 'DD.MM HH:mm:ss',
    timeZone: 0
};

let sign = '';

const makeTime = () =>
    moment().utc().add(CONFIG.timeZone, 'hour').format(CONFIG.datePattern);

const getSign = () =>
    CONFIG.timeZone > 0 ? '+' : '';

const makePattern = () =>
    `${makeTime()} (TZ ${sign}${CONFIG.timeZone})`;


export const configure = <K extends keyof typeof CONFIG, V extends typeof CONFIG[K]>(key: K, value: V): typeof CONFIG => {
    Object.assign(CONFIG, { [key]: value });
    if (key === 'timeZone') {
        sign = getSign();
    }

    return { ...CONFIG };
};

export const log = (...args: Array<any>) =>
    console.log(makePattern(), ...args);

export const warn = (...args: Array<any>) =>
    console.log(makePattern(), yellow(...args));

export const info = (...args: Array<any>) =>
    console.log(makePattern(), blue(...args));

export const error = (...args: Array<any>) =>
    console.log(makePattern(), red(...args));