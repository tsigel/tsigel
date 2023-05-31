import { error, info, log, warn } from './logger';
import { blue, red, yellow, white } from 'chalk';

describe('Logger tests', () => {
    let result: Array<string> = [];
    const originLog = console.log;

    beforeAll(() => {
        console.log = (...args: Array<string>) => {
            result = args;
        };
    });

    afterAll(() => {
        console.log = originLog;
    });

    it('Test log', () => {
        log('Simple test');
        expect(result.slice(1)).toEqual([white('Simple test')]);
    });

    it('Test warn', () => {
        warn('Simple test');
        expect(result.slice(1)).toEqual([yellow('Simple test')]);
    });

    it('Test info', () => {
        info('Simple test');
        expect(result.slice(1)).toEqual([blue('Simple test')]);
    });

    it('Test default day pattern', () => {
        log('');
        expect(result[0]).toMatch(/\d\d\.\d\d\.\d\d\d\d\s\d\d:\d\d:\d\d\s\([+|-]\d\d:\d\d\)/);
    });
});
