/* jshint camelcase:false */

var BPromise = require('bluebird');
var request = BPromise.promisify(require('request'));
var _ = require('lodash');

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
    options = _.assign({}, {
        successHandler: successHandler,
        errorHandler: errorHandler,
        timeout: 15000
    }, options);

    if (singleton[options.url]) {
        return singleton[options.url];
    }

    var requestOptions = _.assign({}, {
        json: true
    }, options);

    singleton[options.url] = request(requestOptions)
        .bind(requestOptions)
        .then(function removePendingRequest(data) {
            singleton[options.url] = false;

            return data;
        })
        .spread(addRespHandlers)
        .spread(options.successHandler)
        .catch(timeoutHandler)
        .catch(options.errorHandler);

    return singleton[options.url];
};
