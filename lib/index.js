/* jshint camelcase:false */

var PPromise = require('promise');
var _request = require('request');
var isNumber = require('isnumber');
var objectAssign = require('object-assign');

function request(opts) {
    return new PPromise(function (res, rej) {
        _request(opts, function (err, resp, body) {
            if (err) {
                return rej(err);
            }

            res([resp, body]);
        });
    });
}

function addRespHandlers(data) {
    var resp = data[0];

    if (resp.statusCode) {
        var statusCodeStart = (resp.statusCode || '').toString()[0];
        resp.success = statusCodeStart === '2';
        resp.failed = !resp.success;
        resp.clientError = statusCodeStart === '4';
        resp.serverError = statusCodeStart === '5';
    }

    return data;
}

function successHandler(resp, body) {
    return body;
}

function errorHandler(err) {
    return PPromise.reject(err);
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

    return PPromise.reject(err);
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

    singleton[options.url] = request(options)
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
        .then(addRespHandlers)
        .then(function callSuccessHandler(args) {
            return options.successHandler.apply(this, args);
        })
        .catch(timeoutHandler.bind(options))
        .catch(options.errorHandler);

    return singleton[options.url];
};
