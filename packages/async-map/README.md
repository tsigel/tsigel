# @tsigel/async-map

A lightweight utility for parallel async mapping with controlled concurrency.

## Installation

```bash
npm install @tsigel/async-map
# or
yarn add @tsigel/async-map
# or
pnpm add @tsigel/async-map
```

## Features

- Process arrays with async operations in parallel
- Control the number of concurrent operations
- Simple, lightweight API with TypeScript support
- Supports both sync and async callbacks
- Maintains original array order regardless of completion order
- Automatically handles errors in promises

## Usage

```typescript
import asyncMap from '@tsigel/async-map';

// Basic usage
const results = await asyncMap(
  3, // number of concurrent operations
  async (item, index) => {
    // Do some async work with each item
    const result = await someAsyncOperation(item);
    return result;
  },
  myArray // array to process
);

// Curried usage
const processItems = asyncMap(
  5,
  async (item, index) => {
    return await someAsyncOperation(item);
  }
);

// Later in your code:
const results = await processItems(myArray);
```

## API

### `asyncMap<T, U>(threads: number, callback: (data: T, index: number) => U | Promise<U>, list?: T[]): Promise<U[]> | ((list: T[]) => Promise<U[]>)`

- **threads**: Maximum number of concurrent operations
- **callback**: Function to process each item, receives the item and its original index
- **list**: Array of items to process

Returns a Promise that resolves to an array of results or a curried function if the list argument is omitted.

## Examples

### Processing API Requests

```typescript
import asyncMap from '@tsigel/async-map';

const fetchUserData = async (userId) => {
  const response = await fetch(`https://api.example.com/users/${userId}`);
  return response.json();
};

// Fetch data for multiple users with max 3 concurrent requests
const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const userData = await asyncMap(3, fetchUserData, userIds);
```

### File Processing

```typescript
import asyncMap from '@tsigel/async-map';
import fs from 'fs/promises';

const files = ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt'];

const processedContents = await asyncMap(2, async (filename, index) => {
  const content = await fs.readFile(filename, 'utf-8');
  return content.toUpperCase();
}, files);
```

### With Error Handling

```typescript
import asyncMap from '@tsigel/async-map';

try {
  const results = await asyncMap(3, async (item) => {
    // This might throw an error
    const result = await riskyOperation(item);
    return result;
  }, items);
  
  console.log('All operations completed successfully:', results);
} catch (error) {
  console.error('An error occurred during processing:', error);
}
```

## Why Use @tsigel/async-map?

- **Performance**: Process items in parallel while controlling resource usage
- **Order Preservation**: Results maintain the same order as the input array
- **Flexibility**: Works with both synchronous and asynchronous operations
- **TypeScript Support**: Fully typed for better developer experience

## License

MIT