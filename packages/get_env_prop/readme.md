# @tsigel/get_env_prop

A lightweight utility for safely accessing and processing environment variables in Node.js applications.

## Installation

```bash
npm install @tsigel/get_env_prop
# or
yarn add @tsigel/get_env_prop
# or
pnpm add @tsigel/get_env_prop
```

## Features

- Safely retrieve environment variables
- Process environment variables with custom transformers
- Built-in utilities for common scenarios (strict validation, list parsing)
- Full TypeScript support with precise type inference
- Helpful error messages for debugging

## Usage

```typescript
import { get_env_prop, strict, list } from '@tsigel/get_env_prop';

// Basic usage - get an environment variable
const apiUrl = get_env_prop('API_URL');

// With strict validation (throws if undefined)
const port = get_env_prop('PORT', strict);

// With custom processing
const dbTimeout = get_env_prop('DB_TIMEOUT', (value) => value ? parseInt(value) : 30000);

// Parse comma-separated list
const allowedOrigins = get_env_prop('ALLOWED_ORIGINS', list());

// Parse list with custom separator
const tags = get_env_prop('TAGS', list('|'));

// Chain processors
const requiredList = get_env_prop('REQUIRED_VALUES', (value) => list()(strict(value)));
```

## API

### `get_env_prop(key: string): string | undefined`

Retrieves an environment variable by key.

- **key**: The name of the environment variable
- **Returns**: The value of the environment variable or `undefined` if not set

### `get_env_prop<T>(key: string, processor: (value: string | undefined) => T): T`

Retrieves and processes an environment variable with a custom processor function.

- **key**: The name of the environment variable
- **processor**: A function that processes the environment variable value
- **Returns**: The processed value

### Built-in Processors

#### `strict(value: string | undefined): string`

Ensures that an environment variable is defined.

- **Throws**: Error if the value is `undefined` or `null`
- **Returns**: The non-empty environment variable value

#### `list(separator?: string)`

Creates a processor that splits a string value into an array.

- **separator**: Optional custom separator (defaults to comma `,`)
- **Returns**: A function that converts a string to an array or returns `undefined` if input is `undefined`

## Examples

### Basic Configuration

```typescript
import { get_env_prop, strict } from '@tsigel/get_env_prop';

// Application configuration
const config = {
  port: get_env_prop('PORT', (value) => parseInt(value || '3000')),
  nodeEnv: get_env_prop('NODE_ENV', (value) => value || 'development'),
  apiKey: get_env_prop('API_KEY', strict),
  dbUrl: get_env_prop('DATABASE_URL', strict)
};
```

### Processing Boolean Values

```typescript
import { get_env_prop } from '@tsigel/get_env_prop';

const isProduction = get_env_prop('NODE_ENV', (value) => value === 'production');
const debugMode = get_env_prop('DEBUG', (value) => value === 'true');
```

### With Default Values

```typescript
import { get_env_prop } from '@tsigel/get_env_prop';

const cacheTimeout = get_env_prop('CACHE_TIMEOUT', (value) => {
  if (!value) return 3600; // default 1 hour
  return parseInt(value);
});
```

### Working with Lists

```typescript
import { get_env_prop, list, strict } from '@tsigel/get_env_prop';

// Optional list
const supportedLanguages = get_env_prop('SUPPORTED_LANGUAGES', list());
// ["en", "fr", "de"] if SUPPORTED_LANGUAGES="en,fr,de"
// undefined if SUPPORTED_LANGUAGES is not defined

// Required list
const requiredFeatures = get_env_prop('REQUIRED_FEATURES', (value) => list()(strict(value)));
// Will throw if REQUIRED_FEATURES is not defined
```

### Custom JSON Parsing

```typescript
import { get_env_prop, strict } from '@tsigel/get_env_prop';

const serverConfig = get_env_prop('SERVER_CONFIG', (value) => {
  if (!value) return { port: 3000, host: 'localhost' };
  try {
    return JSON.parse(value);
  } catch (e) {
    throw new Error(`Invalid JSON in SERVER_CONFIG: ${e.message}`);
  }
});
```

## Error Handling

The library provides helpful error messages if something goes wrong when accessing environment variables:

```typescript
try {
  const requiredValue = get_env_prop('REQUIRED_VALUE', strict);
} catch (error) {
  console.error(error.message); 
  // Outputs: "Error get REQUIRED_VALUE from env! Env value can't be empty!"
}
```

## TypeScript Support

The library is fully typed and provides accurate type inference:

```typescript
// value is string | undefined
const value = get_env_prop('SOME_VAR');

// requiredValue is string (never undefined)
const requiredValue = get_env_prop('REQUIRED', strict);

// numberValue is number
const numberValue = get_env_prop('NUMBER', (val) => parseInt(val || '0'));

// items is string[] | undefined
const items = get_env_prop('ITEMS', list());
```

## License

MIT