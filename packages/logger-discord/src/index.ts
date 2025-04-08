import Transport, { TransportStreamOptions } from 'winston-transport';
import omit from 'ramda/src/omit';

/**
 * Options for Discord transport for winston
 */
interface DiscordTransportOptions extends TransportStreamOptions {
    /** Webhook obtained from Discord */
    webhook: string;
}

/**
 * Nextabit's Discord Transport for winston
 */
export default class DiscordTransport extends Transport {
    /** Webhook obtained from Discord */
    private webhook: string;

    /** Available colors for discord messages */
    private static COLORS: { [key: string]: number } = {
        crit: 10038562,    // #990000 - темно-красный
        error: 14362664,   // #db2828 - красный
        warning: 16497928, // #fbbd08 - желтый
        info: 2196944,     // #2185d0 - синий
        debug: 8421504,    // #808080 - серый
    };

    constructor(opts: DiscordTransportOptions) {
        super(opts);
        this.webhook = opts.webhook;
    }

    /**
     * Function exposed to winston to be called when logging messages
     * @param info Log message from winston
     * @param callback Callback to winston to complete the log
     */
    log(info: any, callback: { (): void }) {
        if (info.discord !== false) {
            setImmediate(() => {
                this.sendToDiscord(info);
            });
        }

        callback();
    }

    /**
     * Sends log message to discord
     */
    private sendToDiscord = async (info: any) => {
        const meta = omit([
            'logger',
            'version',
            'level',
            'message',
            'timestamp'
        ], info);

        const postBody = {
            content: '',
            embeds: [{
                description: info.message,
                color: DiscordTransport.COLORS[info.level],
                fields: [
                    { name: 'logger', value: info.logger },
                    { name: 'level', value: info.level },
                    ...Object.entries(meta).map(([name, value]) => ({ name, value }))
                ],
                timestamp: new Date().toISOString(),
            }]
        };

        const options = {
            url: this.webhook,
            method: 'POST',
            json: true,
            body: postBody
        };

        try {
            await fetch(options.url, {
                method: 'POST',
                headers: {
                    Accept: 'json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(options.body)
            });
        } catch (err) {
            console.error('Error sending to discord');
        }
    };
}
