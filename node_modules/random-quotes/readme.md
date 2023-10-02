# random-quotes

Get random quotes.

## Installation

```bash
$ npm install --save random-quotes
```

## Usage

NodeJS:

```js
const randomQuotes = require('random-quotes');
```

Browsers:

```html
<script src="node_modules/random-quotes/dist/index.umd.min.js"></script>
```

```js
randomQuotes();
//  {
//    body: 'It\'s not poisonous...',
//    author: 'Famous Last Words'
//  }
```

## API

- **`randomQuotes([count=1])`**
  - `count`: _Number_, _Optional_: The number of random quotes to get.
  - Returns a random quote object with the following keys: `author`, `body`
  - When count is given, returns an array of random quotes.

- **`randomQuotes.byAuthor(author)`**
  - `author`: _String_. The name of the author.
  - Returns an array of quotes by the given author. Array will contain the string bodies of the quotes directly.

## License

MIT License
