# @tsigel/logger

A robust and extensible logging module for Node.js applications, built on top of Winston.

## Features

- Multiple log levels (debug, info, warning, error, critical, fatal)
- Structured logging with metadata support
- Automatic serialization of various data types
- Support for both text and JSON output formats
- Error object handling with stack trace preservation
- Process termination on fatal errors with graceful shutdown
- Uncaught exception and unhandled rejection handling
- Logger cloning with metadata inheritance
- Customizable transports

## Installation

```bash
npm install @tsigel/logger
```

Or with Yarn:

```bash
yarn add @tsigel/logger
```

## Usage

### Basic Setup

```typescript
import { makeLoggerModule } from '@tsigel/logger';

// Create the Logger constructor
const Logger = makeLoggerModule({
  outFormat: 'TEXT',  // or 'JSON'
  version: '1.0.0',
  defaultMeta: { 
    app: 'my-service',
    environment: process.env.NODE_ENV 
  }
});

// Create a logger instance for a specific service
const logger = new Logger('api-server', { component: 'startup' });

// Now you can log messages
logger.info('Server starting up');
logger.debug('Configuration loaded:', config);
```

### Logging Levels

The logger supports the following levels (in order of severity):

1. `critical` - Critical errors that require immediate attention
2. `error` - Application errors that should be investigated
3. `warning` - Warning conditions that might lead to errors
4. `info` - Informational messages about normal operation
5. `debug` - Detailed debug information

Plus a special level:

- `fatal` - Critical errors that should terminate the process

### Adding Metadata

You can add metadata to contextualize your logs:

```typescript
// Add metadata to an existing logger
logger.addMeta({ requestId: '1234-5678' });

// Log with the added metadata
logger.info('Processing request');
// Output includes: requestId: '1234-5678'
```

### Cloning Loggers

Create a new logger instance that inherits metadata:

```typescript
function handleRequest(req, res) {
  // Create a new logger with request-specific metadata
  const requestLogger = logger.clone({
    requestId: req.id,
    userId: req.user?.id,
    path: req.path
  });
  
  requestLogger.info('Request received');
  
  // All logs in this request will have the added metadata
}
```

### Handling Errors

```typescript
try {
  await processData();
} catch (error) {
  logger.error('Failed to process data', error);
  // Error objects are automatically serialized with stack traces
}
```

### Fatal Errors

```typescript
async function bootSystem() {
  try {
    await connectToDatabase();
  } catch (error) {
    // This will log the error and terminate the process after 1 second
    await logger.fatal('Failed to connect to database', error);
    // Code here will never execute
  }
}
```

### Custom Transports

You can add additional Winston transports:

```typescript
import { makeLoggerModule } from '@tsigel/logger';
import { transports } from 'winston';
import DiscordTransport from '@tsigel/winston-discord-transport';

const Logger = makeLoggerModule({
  outFormat: 'TEXT',
  version: '1.0.0',
  transports: [
    new transports.File({ filename: 'app.log' }),
    new DiscordTransport({
      webhook: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL'
    })
  ]
});
```

## Advanced Configuration

### Output Formats

The logger supports two output formats:

- `TEXT` - Human-readable format with colors (for console)
- `JSON` - Structured JSON format (better for log aggregation)

### Global Error Handling

The module automatically sets up handlers for uncaught exceptions and unhandled rejections, logging them before exiting the process.

## TypeScript Support

The module is written in TypeScript and provides complete type definitions:

```typescript
import { makeLoggerModule, ILogger, LoggerModule } from '@tsigel/logger';

// Type-safe logger creation
const logger: ILogger = new Logger('my-service');
```

## License

MIT