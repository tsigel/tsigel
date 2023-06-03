
### 

### Get env prop - package to get environment variables.
So that the code explicitly throws exceptions when there are no required variables for the service to work.

#### Example

```typescript
import { getRequiredNumProp, getRequiredProp } from 'getenvprop';

export const PORT = getRequiredNumProp('SERVER_PORT');
export const DATA_BASE_HOST = getRequiredProp('DATA_BASE_HOST');
```
