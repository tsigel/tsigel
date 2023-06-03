import { getRequiredBoolProp, getRequiredNumProp, getRequiredProp } from './index';

describe('Get required property tests', () => {
    let code: number | undefined = undefined;
    let message: string[] = [];

    const origin_exit = process.exit;
    const origin_error = console.error;

    const make_test_env = (name: string, value: string | undefined, cb: () => void) => {
        if (typeof value === 'undefined') {
            delete process.env[name];
        } else {
            process.env[name] = value;
        }
        try {
            cb();
            delete process.env[name];
        } catch (e) {
            delete process.env[name];
            throw e;
        }
    };

    beforeEach(() => {
        code = undefined;
        message = [];
        const my_error = (...data: Array<string>) => {
            message.push(data[1]);
        };
        const my_exit = (exit_code: number) => {
            code = exit_code;
        };

        console.error = my_error;
        (process as any).exit = my_exit;
    });

    afterEach(() => {
        (process as any).exit = origin_exit;
        console.error = origin_error;
    });

    describe('With exception', () => {
        it('Get required property', () => {
            getRequiredProp('SOME_NAME');
            expect(code).toBe(1);
            expect(message[0]).toContain(`Has no required property SOME_NAME in env!`);
        });

        it('Get number property', () => {
            make_test_env('SOME_NAME', undefined, () => {
                getRequiredNumProp('SOME_NAME');
                expect(code).toBe(1);
                expect(message[0]).toContain(`Has no required property SOME_NAME in env!`);
            });
        });

        it('Invalid number env prop', () => {
            make_test_env('SOME_NAME', 'VVV', () => {
                getRequiredNumProp('SOME_NAME');
                expect(code).toBe(1);
                expect(message[0]).toContain(`Invalid number property SOME_NAME!`);
            });
        });

        it('Get boolean property', () => {
            getRequiredBoolProp('SOME_NAME');
            expect(code).toBe(1);
            expect(message[0]).toContain(`Has no required property SOME_NAME in env!`);
        });

        it('Invalid boolean env prop', () => {
            make_test_env('SOME_NAME', 'VVV', () => {
                getRequiredBoolProp('SOME_NAME');
                expect(code).toBe(1);
                expect(message[0]).toContain(`Invalid value in prop SOME_NAME! Available values is 1, 0, true, false.`);
            });
        });
    });

    describe('Without exception', () => {
        it('Get required property', () => {
            make_test_env('SOME_NAME', 'some_text', () => {
                const value = getRequiredProp('SOME_NAME');
                expect(code).toBe(undefined);
                expect(value).toBe('some_text');
            });
        });

        it('Get required number property', () => {
            make_test_env('SOME_NAME', '1', () => {
                const value = getRequiredNumProp('SOME_NAME');
                expect(code).toBe(undefined);
                expect(value).toBe(1);
            });
        });

        it('Get required boolean property', () => {
            make_test_env('SOME_NAME', '0', () => {
                const value = getRequiredBoolProp('SOME_NAME');
                expect(code).toBe(undefined);
                expect(value).toBe(false);
            });
        });

    });
});
