# Fetch-Once [![Circle CI](https://circleci.com/gh/AlexMeah/fetch-once/tree/master.svg?style=svg)](https://circleci.com/gh/AlexMeah/fetch-once/tree/master)

[![Greenkeeper badge](https://badges.greenkeeper.io/AlexMeah/fetch-once.svg)](https://greenkeeper.io/)

Ensure requests are only made once no matter how many times your application calls them, support custom cache lengths.

### options

- Supports all request options


```js
{
    cache: true|false|int, // default: true
    successHandler: fn // For heavy processing of response only performed once
}
```

### Example usage

```js

// pendingRequests (singleton)
var requests = {};

// Component1.js
var fetchOnce = require('fetch-once');

fetchOnce(requests, {
    url: 'http://google.com'
}).then(function (data) {
    // use data in render
});

// Component2.js
var fetchOnce = require('fetch-once');

fetchOnce(requests, {
    url: 'http://google.com'
}).then(function (data) {
    // use data in render
});

```
