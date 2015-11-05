/* jshint camelcase:false */

var axios = require('axios');
var isNumber = require('isnumber');
var objectAssign = require('object-assign');

function addRespHandlers(resp) {
    var statusCodeStart = (resp.status || '').toString()[0];
    resp.success = statusCodeStart === '2';
    resp.failed = !resp.success;
    resp.clientError = statusCodeStart === '4';
    resp.serverError = statusCodeStart === '5';

    return resp;
}

function successHandler(resp) {
    return resp.data;
}

function errorHandler(err) {
    return Promise.reject(err);
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

    return Promise.reject(err);
}

module.exports = function getData(singleton, _options) {
    var options = objectAssign({}, {
        successHandler: successHandler,
        errorHandler: errorHandler,
        timeout: 15000,
        json: true,
        cache: true
    }, _options);

    if (singleton[options.url] && options.cache !== false) {
        return singleton[options.url];
    }

    singleton[options.url] = axios(options)
        .catch(function (resp) {
            if (resp instanceof Error) {
                return Promise.reject(resp);
            } else {
                return resp;
            }
        })
        .then(addRespHandlers)
        .then(function removePendingRequest(resp) {
            if (isNumber(options.cache)) {
                setTimeout(function (url) {
                    singleton[url] = false;
                }, options.cache, options.url);
            } else if (options.cache !== true) {
                singleton[options.url] = false;
            }

            return resp;
        })
        .then(options.successHandler)
        .catch(timeoutHandler.bind(options))
        .catch(options.errorHandler);

    return singleton[options.url];
};
