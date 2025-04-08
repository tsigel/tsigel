# @tsigel/type-utils

A collection of TypeScript utility types to enhance type safety and developer experience in your projects.

## Installation

```bash
npm install @tsigel/type-utils
```

Or with Yarn:

```bash
yarn add @tsigel/type-utils
```

## Available Type Utilities

### Promise and Array Utilities

```typescript
// Extract the type inside a Promise
import { PromiseEntry } from '@tsigel/type-utils';

type UserPromise = Promise<{ id: string, name: string }>;
type User = PromiseEntry<UserPromise>; // { id: string, name: string }

// Extract the type inside an Array
import { ArrayEntry } from '@tsigel/type-utils';

type UsersArray = Array<{ id: string, name: string }>;
type User = ArrayEntry<UsersArray>; // { id: string, name: string }
```

### Object Type Manipulation

```typescript
// Replace a specific property type in an object
import { Replace } from '@tsigel/type-utils';

type User = { id: string, age: number, name: string };
type UserWithNumericId = Replace<User, 'id', number>; 
// { id: number, age: number, name: string }

// Make specific properties optional
import { Optional } from '@tsigel/type-utils';

type RequiredUser = { id: string, age: number, name: string };
type OptionalUser = Optional<RequiredUser, 'age' | 'name'>;
// { id: string, age?: number, name?: string }
```

### Function Type Utilities

```typescript
// Define function types with specific arguments and return type
import { Func } from '@tsigel/type-utils';

type AddFunction = Func<[number, number], number>;
// Equivalent to: (arg1: number, arg2: number) => number

const add: AddFunction = (a, b) => a + b;
```

### Type Constraints

```typescript
// Ensure a type is a subtype of another type
import { StrictType } from '@tsigel/type-utils';

type NumberOrString = number | string;
type OnlyNumber = StrictType<NumberOrString, number>; // Only accepts 'number'

const num: OnlyNumber = 42; // Valid
const str: OnlyNumber = "hello"; // Error: Type 'string' is not assignable...
```

### Schema Conversion

```typescript
// Convert an object to match a target schema
import { ConvertSchema } from '@tsigel/type-utils';

type InputObject = { name: string, age: string, active: boolean };
type TargetSchema = { name: string, age: number, active: boolean };

type Converter = ConvertSchema<InputObject, TargetSchema>;
// Function that converts string age to number age
```

### Timestamp Addition

```typescript
// Add a timestamp property to any type
import { WithTs } from '@tsigel/type-utils';

type User = { id: string, name: string };
type TimestampedUser = WithTs<User>;
// { id: string, name: string, timestamp: number }
```

### Property Path Utilities

```typescript
// Get all possible property paths as string literals
import { PropertyStringPath } from '@tsigel/type-utils';

type User = {
  id: string,
  profile: {
    name: string,
    address: {
      city: string,
      country: string
    }
  }
};

type UserPaths = PropertyStringPath<User>;
// "id" | "profile" | "profile.name" | "profile.address" | "profile.address.city" | "profile.address.country"

// Get the type of a value at a specific path
import { ValueByPath } from '@tsigel/type-utils';

type CityType = ValueByPath<User, "profile.address.city">; // string
```

## Use Cases

- **Enhanced Type Safety**: Define stricter type constraints
- **API Integration**: Extract types from response promises
- **Form Handling**: Make specific fields optional or required
- **Data Transformation**: Define conversion functions between schemas
- **Path-based Operations**: Access nested properties type-safely
- **Event Handling**: Add timestamps to events

## License

MIT