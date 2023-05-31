import chalk from 'chalk';
import dayjs from 'dayjs';

const serialize = (data: any) => {
    switch (typeof data) {
        case 'number':
        case 'string':
        case 'symbol':
            return data;
        default:
            return JSON.stringify(data, null, 4);
    }
};
const out = (isError: boolean, formatter: (message: string) => string, data: Array<any>) => {
    const message = data.map(serialize).join(' ');
    const method = isError ? 'error' : 'log';
    const now = dayjs();
    console[method](`${now.format('DD.MM.YYYY HH:mm:ss (Z)')}: `, formatter(message));
};

export const log = (...data: Array<any>) => out(false, chalk.white, data);

export const info = (...data: Array<any>) => out(false, chalk.blue, data);

export const warn = (...data: Array<any>) => out(false, chalk.yellow, data);

export const error = (...data: Array<any>) => out(true, chalk.red, data);
