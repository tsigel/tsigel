
### 

### Get env prop - package to get environment variables.
So that the code explicitly throws exceptions when there are no required variables for the service to work.

#### Example

```typescript
import { get_env_prop, strict } from '@tsigel/get_env_prop';
import { pipe } from 'ramda';

export const PORT = get_env_prop('SERVER_PORT', pipe(strict, Number));
export const DATA_BASE_HOST = get_env_prop('DATA_BASE_HOST', strict);
```
