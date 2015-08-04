# Fetch-Once [![Circle CI](https://circleci.com/gh/AlexMeah/fetch-once/tree/master.svg?style=svg)](https://circleci.com/gh/AlexMeah/fetch-once/tree/master)

Ensure requests are only made once no matter how many times your application calls them

### Example usage

```js

// pendingRequests (singleton)
var pendingRequests = {};

// Component1.js
var fetchOnce = require('fetch-once');

fetchOnce(pendingRequests, {
    url: 'http://google.com'
}).then(function (data) {
    // use data in render
});

// Component2.js
var fetchOnce = require('fetch-once');

fetchOnce(pendingRequests, {
    url: 'http://google.com'
}).then(function (data) {
    // use data in render
});

```
