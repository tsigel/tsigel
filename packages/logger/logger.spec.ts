import { configure, error, info, log, warn } from './logger';
import { blue, red, yellow } from 'chalk';

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
        expect(result.slice(1)).toEqual(['Simple test']);
    });

    it('Test warn', () => {
        warn('Simple test');
        expect(result.slice(1)).toEqual([yellow('Simple test')]);
    });

    it('Test error', () => {
        error('Simple test');
        expect(result.slice(1)).toEqual([red('Simple test')]);
    });

    it('Test info', () => {
        info('Simple test');
        expect(result.slice(1)).toEqual([blue('Simple test')]);
    });

    it('Test default day pattern', () => {
        log('');
        expect(result[0]).toMatch(/\d\d\.\d\d\s\d\d:\d\d:\d\d\s\(TZ\s0\)/);
    });

    it('Test custom day pattern', () => {
        const defaultConfig = configure('timeZone', 0);
        configure('datePattern', 'DD.MM');
        log('');
        configure('datePattern', defaultConfig.datePattern);

        expect(result[0]).toMatch(/\d\d\.\d\d\s\(TZ\s0\)/);
    });

    describe('Test custom time zone', () => {
        it('Test timeZone gt zero', () => {
            configure('timeZone', 1);
            log('');
            configure('timeZone', 0);

            expect(result[0]).toMatch(/\d\d\.\d\d\s\d\d:\d\d:\d\d\s\(TZ\s\+1\)/);
        });
        it('Test timeZone lt zero', () => {
            configure('timeZone', -1);
            log('');
            configure('timeZone', 0);

            expect(result[0]).toMatch(/\d\d\.\d\d\s\d\d:\d\d:\d\d\s\(TZ\s\-1\)/);
        });
    });
});
