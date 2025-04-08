import { ILogger, makeLoggerModule } from './index';
import { createLogger } from 'winston';
import Transport from 'winston-transport';

// Мокаем зависимости
jest.mock('winston', () => {
    const originalModule = jest.requireActual('winston');
    return {
        ...originalModule,
        createLogger: jest.fn().mockReturnValue({
            info: jest.fn(),
            warning: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            crit: jest.fn()
        })
    };
});

jest.mock('@tsigel/wait', () => ({
    wait: jest.fn().mockResolvedValue(undefined)
}));

// Мокаем process.exit
const originalExit = process.exit;
process.exit = jest.fn() as any;

describe('Logger Module', () => {
    let Logger: ReturnType<typeof makeLoggerModule>;
    let logger: ILogger;
    let mockTransport: Transport;

    beforeEach(() => {
        jest.clearAllMocks();

        // Создаем мок для транспорта
        mockTransport = new Transport();

        // Инициализируем модуль логирования
        Logger = makeLoggerModule({
            outFormat: 'TEXT',
            version: '1.0.0',
            defaultMeta: { environment: 'test' },
            transports: [mockTransport as any]
        });

        logger = new Logger('test-service', { component: 'test-component' });
    });

    afterAll(() => {
        process.exit = originalExit;
    });

    it('should create a logger with correct service name and meta', () => {
        expect(createLogger).toHaveBeenCalled();
        expect(logger).toBeInstanceOf(Logger);
    });

    it('should log messages with the correct level', () => {
        const winstonInstance = (createLogger as jest.Mock).mock.results[0].value;

        logger.info('Info message');
        expect(winstonInstance.info).toHaveBeenCalledWith('Info message', expect.objectContaining({
            'component': 'test-component',
            'logger': 'test-service',
            'version': '1.0.0'
        }));

        logger.warning('Warning message');
        expect(winstonInstance.warning).toHaveBeenCalledWith('Warning message', expect.any(Object));

        logger.error('Error message');
        expect(winstonInstance.error).toHaveBeenCalledWith('Error message', expect.any(Object));

        logger.debug('Debug message');
        expect(winstonInstance.debug).toHaveBeenCalledWith('Debug message', expect.any(Object));

        logger.critical('Critical message');
        expect(winstonInstance.crit).toHaveBeenCalledWith('Critical message', expect.any(Object));
    });

    it('should handle multiple arguments by serializing them', () => {
        const winstonInstance = (createLogger as jest.Mock).mock.results[0].value;

        const error = new Error('Test error');
        const obj = { foo: 'bar', num: 42 };

        logger.info('Message with', error, obj);

        expect(winstonInstance.info).toHaveBeenCalledWith(
            expect.stringContaining('Message with'),
            expect.any(Object)
        );
        expect(winstonInstance.info.mock.calls[0][0]).toContain('Message with');
        expect(winstonInstance.info.mock.calls[0][0]).toContain('[Error Error]: Test error');
        expect(winstonInstance.info.mock.calls[0][0]).toContain(JSON.stringify(obj, null, 4));
    });

    it('should add metadata to the logger', () => {
        const winstonInstance = (createLogger as jest.Mock).mock.results[0].value;

        logger.addMeta({ requestId: '123' });
        logger.info('Test message');

        expect(winstonInstance.info).toHaveBeenCalledWith('Test message', expect.objectContaining({
            requestId: '123',
            component: 'test-component'
        }));
    });

    it('should clone logger with new metadata', () => {
        const winstonInstance = (createLogger as jest.Mock).mock.results[0].value;

        const newLogger = logger.clone({ userId: '456' });
        newLogger.info('Test message from cloned logger');

        expect(winstonInstance.info).toHaveBeenCalledWith(
            'Test message from cloned logger',
            expect.objectContaining({
                component: 'test-component',
                userId: '456'
            })
        );

        // Оригинальный логгер не должен иметь новые метаданные
        logger.info('Original logger message');
        expect(winstonInstance.info).toHaveBeenCalledWith(
            'Original logger message',
            expect.objectContaining({
                component: 'test-component'
            })
        );
        expect(winstonInstance.info.mock.calls[1][1]).not.toHaveProperty('userId');
    });

    it('should handle fatal errors and exit process', async () => {
        const { wait } = require('@tsigel/wait');
        const winstonInstance = (createLogger as jest.Mock).mock.results[0].value;

        // Начинаем отслеживать промис, но не ждем его завершения
        const fatalPromise = logger.fatal('Fatal error');

        // Проверяем, что crit был вызван с правильными аргументами
        expect(winstonInstance.crit).toHaveBeenCalledWith('Fatal error', expect.any(Object));

        // Симулируем ожидание
        await wait.mock.results[0].value;

        // Проверяем, что process.exit был вызван с кодом 1
        expect(process.exit).toHaveBeenCalledWith(1);

        // Для промиса, который никогда не разрешается, можно использовать
        // один из следующих подходов:

        // Вариант 1: Проверяем, что промис все еще находится в состоянии pending
        // Добавляем таймаут для теста, если промис каким-то образом разрешится
        const promiseStatus = await Promise.race([
            Promise.resolve('pending'),
            fatalPromise.then(() => 'resolved').catch(() => 'rejected')
        ]);
        expect(promiseStatus).toBe('pending');

        // Вариант 2: Альтернативный подход с использованием jest.fn
        const resolvedCallback = jest.fn();
        const rejectedCallback = jest.fn();
        fatalPromise.then(resolvedCallback).catch(rejectedCallback);

        // После задержки ни один из колбэков не должен быть вызван
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(resolvedCallback).not.toHaveBeenCalled();
        expect(rejectedCallback).not.toHaveBeenCalled();
    });

    it('should handle serialization of different types', () => {
        const winstonInstance = (createLogger as jest.Mock).mock.results[0].value;

        const testCases = [
            { input: 'string value', expected: 'string value' },
            { input: 42, expected: '42' },
            { input: BigInt(42), expected: '42' },
            { input: Symbol('test'), expected: 'Symbol(test)' },
            { input: { nested: { value: 'test' } }, expected: JSON.stringify({ nested: { value: 'test' } }, null, 4) },
            {
                input: { bigint: BigInt(9007199254740991) },
                expected: expect.stringContaining('"bigint": "9007199254740991"')
            }
        ];

        testCases.forEach(({ input, expected }, index) => {
            logger.info(input);
            expect(winstonInstance.info.mock.calls[index][0]).toEqual(expected);
        });
    });

    it('should handle error objects specially', () => {
        const winstonInstance = (createLogger as jest.Mock).mock.results[0].value;

        const error = new Error('Test error message');
        logger.error(error);

        const loggedMessage = winstonInstance.error.mock.calls[0][0];
        expect(loggedMessage).toContain('[Error Error]: Test error message');
        expect(loggedMessage).toContain(error.stack);
    });

    it('should set up process handlers for uncaught exceptions', () => {
        // Проверяем, что обработчики событий установлены
        const processOnSpy = jest.spyOn(process, 'on');

        // Пересоздаем логгер, чтобы вызвать установку обработчиков
        Logger = makeLoggerModule({
            outFormat: 'TEXT',
            version: '1.0.0'
        });

        expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
        expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));

        // Восстанавливаем оригинальный spy
        processOnSpy.mockRestore();
    });
});