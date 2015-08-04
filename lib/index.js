/* jshint camelcase:false */

var BPromise = require('bluebird');
var request = BPromise.promisify(require('request'));
var isNumber = require('isnumber');
var objectAssign = require('object-assign');

function addRespHandlers(resp, body) {
    if (resp.statusCode) {
        var statusCodeStart = (resp.statusCode || '').toString()[0];
        resp.success = statusCodeStart === '2';
        resp.failed = !resp.success;
        resp.clientError = statusCodeStart === '4';
        resp.serverError = statusCodeStart === '5';
    }

    return [resp, body];
}

function successHandler(resp, body) {
    return body;
}

function errorHandler(err) {
    return BPromise.reject(err);
}

function timeoutHandler(err) {
    if (
        err && (
            err.code === 'ECONNRESET' || // Socket hang up
            err.code === 'ESOCKETTIMEDOUT' || // Socket hang up
            (err.name === 'OperationalError' && err.cause.code === 'ETIMEDOUT') || // Request time out
            err.code === 'ETIMEDOUT' // Request time out
        )
    ) {
        var errorUrl = this.url.split('?');
        err.statusCode = 503;
        err.timeout = true;
        err.message += ': ' + errorUrl[0];
    }

    return BPromise.reject(err);
}

module.exports = function getData(singleton, options) {
    options = objectAssign({}, {
        successHandler: successHandler,
        errorHandler: errorHandler,
        timeout: 15000,
        json: true,
        cache: true
    }, options);

    if (singleton[options.url] && options.cache !== false) {
        return singleton[options.url];
    }

    singleton[options.url] = request(options)
        .bind(options)
        .then(function removePendingRequest(data) {
            if (isNumber(options.cache)) {
                setTimeout(function (url) {
                    singleton[url] = false;
                }, options.cache, options.url);
            } else if (options.cache !== true) {
                singleton[options.url] = false;
            }

            return data;
        })
        .spread(addRespHandlers)
        .spread(options.successHandler)
        .catch(timeoutHandler)
        .catch(options.errorHandler);

    return singleton[options.url];
};
