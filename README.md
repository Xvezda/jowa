# jowa

## What is it for?

It's a specification and also a library designed to express values that cannot be represented in JSON as valid JSON, and to assist in receiving and using them through Web APIs.

## Examples

`/api/patterns/greet`
```json
{
  "ctor": "RegExp",
  "args": ["hello,? (\\w+)", "ig"]
}
```

```ts
import { fromSchema } from 'jowa';

const greetSchema = await fetch('/api/patterns/greet').then(r => r.json());
const greetRegex = fromSchema(greetSchema);

console.log(greetRegex instanceof RegExp);  // true

const [, userName] = 'Hello, Xvezda!'.match(greetRegex);

console.log(userName);  // Xvezda
```
