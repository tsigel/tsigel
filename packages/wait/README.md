# @tsigel/wait

A lightweight utility for creating Promise-based timeouts in JavaScript and TypeScript applications.

## Installation

```bash
npm install @tsigel/wait
```

Or with Yarn:

```bash
yarn add @tsigel/wait
```

## Usage

The package exports a simple function that returns a Promise which resolves after the specified timeout duration.

### Basic Usage

```javascript
import wait from '@tsigel/wait';

// Wait for 1 second
await wait(1000);
console.log('This will log after 1 second');
```

### With Async/Await

```javascript
import wait from '@tsigel/wait';

async function example() {
  console.log('Starting operation');
  await wait(2000); // Wait for 2 seconds
  console.log('Operation completed after 2 seconds');
}

example();
```

### In a React Component

```jsx
import React, { useEffect, useState } from 'react';
import wait from '@tsigel/wait';

function DelayedComponent() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      // Simulate a loading delay
      await wait(3000);
      setIsLoaded(true);
    }
    
    load();
  }, []);

  return (
    <div>
      {isLoaded ? <p>Content loaded!</p> : <p>Loading...</p>}
    </div>
  );
}
```

### Chaining Promises

```javascript
import wait from '@tsigel/wait';

fetchData()
  .then(data => {
    // Process data
    return wait(500).then(() => processNextStep(data));
  })
  .then(() => {
    console.log('Processing complete after delay');
  });
```

## API

### wait(timeout: number): Promise&lt;void&gt;

Creates a Promise that resolves after the specified timeout.

#### Parameters

- `timeout`: The duration to wait in milliseconds.

#### Returns

A Promise that resolves after the specified timeout.

## License

MIT