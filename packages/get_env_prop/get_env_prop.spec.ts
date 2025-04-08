import { get_env_prop, list, strict } from './index';

describe('get_env_prop', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    it('should return the raw env variable value', () => {
        process.env.TEST_KEY = 'raw_value';
        expect(get_env_prop('TEST_KEY')).toBe('raw_value');
    });

    it('should return undefined if env variable does not exist', () => {
        delete process.env.TEST_MISSING;
        expect(get_env_prop('TEST_MISSING')).toBeUndefined();
    });

    it('should return processed value with processor function', () => {
        process.env.TEST_NUM = '42';
        const result = get_env_prop('TEST_NUM', (v) => parseInt(v || '', 10));
        expect(result).toBe(42);
    });

    it('should throw error with message if processor throws', () => {
        expect(() => get_env_prop('TEST_FAIL', () => {
            throw new Error('broken');
        })).toThrow('Error get TEST_FAIL from env! broken');
    });
});

describe('strict', () => {
    it('should return value if defined', () => {
        expect(strict('defined')).toBe('defined');
    });

    it('should throw if value is null or undefined', () => {
        expect(() => strict(undefined)).toThrow('Env value can\'t be empty!');
        expect(() => strict(null as any)).toThrow('Env value can\'t be empty!');
    });
});

describe('list', () => {
    it('should return undefined if input is undefined', () => {
        expect(list()(undefined)).toBeUndefined();
    });

    it('should split by default comma', () => {
        expect(list()('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('should split by custom separator', () => {
        expect(list('|')('a|b|c')).toEqual(['a', 'b', 'c']);
    });
});
