import { createLogger, format, transports } from 'winston';
import Transport from 'winston-transport';
import isNotNil from 'ramda/src/isNotNil';
import omit from 'ramda/src/omit';
import { wait } from '@tsigel/wait';
import type { Func } from '@tsigel/type-utils';

export type TransportStream = Transport;

const serialize = (data: any) => {
    if (data instanceof Error) {
        return [`[Error ${data.name}]: ${data.message}`, data.stack].join('\n');
    }
    switch (typeof data) {
        case 'string':
        case 'number':
        case 'bigint':
        case 'symbol':
            return String(data);
        default:
            return JSON.stringify(
                data,
                (key, value) => {
                    switch (typeof value) {
                        case 'bigint':
                            return value.toString();
                        default:
                            return value;
                    }
                },
                4
            );
    }
};

const compare = (a: string, b: string) =>
    a > b ? 1 : a < b ? -1 : 0;

const console_format = format.printf(
    ({ level, message, timestamp, logger, ...props }) => {
        const other_props = Object.entries(omit(['version'], props))
            .sort((a, b) => compare(a[0], b[0]))
            .map(([name, value]) => `[${name}: ${value}]`)
            .join(' ');
        return `${timestamp} ${level} [${logger}] ${other_props}: ${message}`;
    }
);

const LEVELS = {
    crit: 1,
    error: 2,
    warning: 3,
    info: 4,
    debug: 5,
};

export const makeLoggerModule = (props: LoggerModuleProps): ILoggerConstructor => {

    const winston = createLogger({
        defaultMeta: props.defaultMeta,
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZZ' }),
            format.json()
        ),
        levels: LEVELS,
        transports: [
            new transports.Console({
                format:
                    props.outFormat === 'JSON'
                        ? format.json()
                        : format.combine(format.colorize(), format.simple(), console_format),
            }),
            ...(props?.transports ?? [])
        ].filter(isNotNil),
    });

    const log_and_exit = (logger: Logger, ...messages: Array<any>) => {
        return new Promise<never>(() => {
            logger.critical(...messages);
            wait(1_000).then(() => process.exit(1));
        });
    };

    class Logger {
        private readonly log_service: string;
        private readonly meta: Meta = Object.create(null);
        private silentMode: boolean = false;

        constructor(service: string, meta?: Meta) {
            this.log_service = service;
            Object.assign(this.meta, meta ?? {});
        }

        public changeSilentMode(mode: boolean) {
            this.silentMode = mode;
        }

        private log(level: Level, log_parts: Array<any>) {
            if (this.silentMode) {
                return void 0;
            }

            const message = log_parts.map(serialize).join('\n');

            winston[level](message, {
                logger: this.log_service,
                version: props.version,
                ...this.meta
            });
        }

        public addMeta(meta: Meta): void {
            Object.assign(this.meta, meta);
        }

        public clone(newMeta: Meta): Logger {
            const logger = new Logger(
                this.log_service,
                Object.assign(Object.create(null), this.meta, newMeta)
            );
            logger.changeSilentMode(this.silentMode);
            return logger;
        }

        public info(...args: Array<any>): void {
            this.log('info', args);
        }

        public warning(...args: Array<any>): void {
            this.log('warning', args);
        }

        public debug(...args: Array<any>): void {
            this.log('debug', args);
        }

        public error(...args: Array<any>): void {
            this.log('error', args);
        }

        public critical(...args: Array<any>): void {
            this.log('crit', args);
        }

        public fatal(...args: Array<any>): Promise<never> {
            return log_and_exit(this, ...args);
        }
    }

    type Level = 'info' | 'warning' | 'error' | 'debug' | 'crit';
    type TemplateParam<T, Status extends boolean> = Status extends true
        ? { data: T; time: number; ok: Status }
        : { data: Error; time: number; ok: Status };

    const handler = (error: Error, origin: string) => {
        return log_and_exit(
            new Logger('root'),
            `Uncaught exception (${origin}):`,
            error
        );
    };

    if (!props.noHandleGlobalError) {
        process.on('uncaughtException', handler);
        process.on('unhandledRejection', handler);
    }

    return Logger;
};

export default makeLoggerModule;

type LoggerModuleProps = {
    outFormat: 'TEXT' | 'JSON';
    version: string;
    defaultMeta?: Meta;
    transports?: TransportStream[],
    noHandleGlobalError?: boolean
}

export type Meta = Record<string, string | number | boolean>;
export type LoggerModule = Func<[LoggerModuleProps], ILoggerConstructor>;

export interface ILogger {
    info(...args: any[]): void;

    warning(...args: any[]): void;

    debug(...args: any[]): void;

    error(...args: any[]): void;

    critical(...args: any[]): void;

    fatal(...args: any[]): Promise<never>;

    addMeta(meta: Meta): void;

    clone(newMeta: Meta): ILogger;

    changeSilentMode(mode: boolean): void;
}

export type CreateLogger = (serviceName: string, meta?: Meta) => ILogger;

export interface ILoggerConstructor {
    new(service: string, meta?: Meta): ILogger;
}
