# Winston Discord Transport

A Winston transport for sending logs to Discord channels via webhooks.

## Installation

```bash
npm install @tsigel/logger-discord
```

Or with Yarn:

```bash
yarn add @tsigel/logger-discord
```

## Features

- Send Winston logs directly to Discord channels
- Color-coded embeds based on log level
- Customizable fields and formatting
- Supports all Winston log levels
- Ability to selectively disable Discord logging for specific messages

## Usage

### Basic Setup

```typescript
import winston from 'winston';
import DiscordTransport from '@tsigel/logger-discord';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { logger: 'app-name' },
  transports: [
    new winston.transports.Console(),
    new DiscordTransport({
      webhook: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL'
    })
  ]
});

// Now you can log messages that will be sent to Discord
logger.info('This is an info message');
logger.error('This is an error message');
```

### Disabling Discord for Specific Messages

You can skip sending specific log messages to Discord by setting `discord: false` in the metadata:

```typescript
// This message will NOT be sent to Discord
logger.info('This message stays out of Discord', { discord: false });

// This message WILL be sent to Discord
logger.warn('This is a warning that will appear in Discord');
```

### Custom Meta Fields

Any additional fields you include in your log will be sent as fields in the Discord embed:

```typescript
logger.error('Payment processing failed', {
  orderId: '12345',
  userId: 'user-abc-123',
  amount: 99.99
});
```

This will create an error message in Discord with fields for `orderId`, `userId`, and `amount`.

## Color Coding

Messages are color-coded in Discord based on their log level:

| Level   | Color                                              |
|---------|---------------------------------------------------|
| crit    | Dark Red (#990000)                                |
| error   | Red (#db2828)                                     |
| warning | Yellow (#fbbd08)                                  |
| info    | Blue (#2185d0)                                    |
| debug   | Gray (#808080)                                    |

## Options

The transport accepts the following options:

| Option   | Type   | Description                                |
|----------|--------|--------------------------------------------|
| webhook  | string | *Required* - Discord webhook URL           |
| level    | string | Minimum level to log (inherits from logger) |
| format   | Format | Winston format (inherits from logger)       |

Additionally, it supports all options from Winston's `TransportStreamOptions`.

## License

MIT