var proxyquire = require('proxyquire').noCallThru();
var nock = require('nock');
require('chai').should();
var PPromise = require('promise');

describe('Data module - getData', function () {
    var fetchOnce = require('../lib');
    var singleton;

    beforeEach(function (done) {
        singleton = {};

        done();
    });

    afterEach(function () {
        nock.cleanAll();
    });

    it('should return a promise and make a request', function (done) {
        nock('http://this.is')
            .get('/a/test')
            .times(1)
            .reply(200, 'all about how...');

        fetchOnce(singleton, {
                url: 'http://this.is/a/test'
            })
            .then(function (result) {
                result.should.equal('all about how...');
                done();
            })
            .catch(done);
    });

    it('should only ever make one request per incoming server request', function (done) {
        nock('http://this.is')
            .get('/a/test')
            .times(1)
            .reply(200, 'all about how...');

        PPromise.all([
            fetchOnce(singleton, {
                url: 'http://this.is/a/test'
            }),
            fetchOnce(singleton, {
                url: 'http://this.is/a/test'
            })
        ]).then(function (data) {
            var req1 = data[0];
            var req2 = data[1];

            req1.should.equal('all about how...');
            req2.should.equal('all about how...');

            done();
        }).catch(done);
    });

    it('should resolve with response and body to check if the request was bad', function (done) {
        nock('http://this.is')
            .get('/a/fail')
            .times(1)
            .reply(500, 'never...');

        fetchOnce(singleton, {
                url: 'http://this.is/a/fail',
                successHandler: function (response, result) {
                    response.statusCode.should.equal(500);
                    result.should.equal('never...');

                    done();
                }
            })
            .catch(done);
    });

    it('should add resp status helpers', function (done) {
        nock('http://this.is')
            .get('/a/success')
            .times(1)
            .reply(200, 'never...');

        fetchOnce(singleton, {
                url: 'http://this.is/a/success',
                successHandler: function (resp) {
                    resp.success.should.equal(true);
                    resp.failed.should.equal(false);
                    resp.clientError.should.equal(false);
                    resp.serverError.should.equal(false);

                    done();
                }
            })
            .catch(done);
    });

    it('should honour a successHandler function passed in', function (done) {
        nock('http://this.is')
            .get('/a/success')
            .times(1)
            .reply(200, 'never...');

        fetchOnce(singleton, {
            url: 'http://this.is/a/success',
            successHandler: function () {
                return 'HELLO';
            }
        }).then(function (data) {
            data.should.equal('HELLO');
            done();
        }).catch(done);
    });

    it('should honour a errorHandler function passed in', function (done) {
        nock('http://this.is')
            .get('/a/success')
            .times(1)
            .reply(200, 'never...');

        var _fetchOnce = proxyquire('../lib', {
            request: function (options, cb) {
                cb(new Error('fail'));
            }
        });

        _fetchOnce(singleton, {
            url: 'http://this.is/a/success',
            errorHandler: function () {
                return 'HELLO';
            }
        }).then(function (data) {
            data.should.equal('HELLO');
            done();
        }).catch(done);
    });

    it('should add the url to the error message for the error is a ETIMEDOUT or ECONNRESET', function (done) {
        nock('http://this.is')
            .get('/a/timeout')
            .delayConnection(2000)
            .times(1)
            .reply(200, 'timeout...');

        fetchOnce(singleton, {
            url: 'http://this.is/a/timeout',
            timeout: 1
        }).catch(function (err) {
            err.message.should.contain('http://this.is/a/timeout');
            done();
        }).catch(done);
    });

    it('should add the url to the error message even if the user passes a custom errorHandler', function (done) {
        nock('http://this.is')
            .get('/a/timeout')
            .delayConnection(2000)
            .times(1)
            .reply(200, 'timeout...');

        fetchOnce(singleton, {
            url: 'http://this.is/a/timeout',
            timeout: 1,
            errorHandler: function (err) {
                err.message.should.contain('http://this.is/a/timeout');
                done();
            }
        }).catch(done);
    });

    it('should cache by default', function (done) {
        nock('http://this.is')
            .get('/a/success')
            .times(1)
            .reply(200, 'success...');

        fetchOnce(singleton, {
            url: 'http://this.is/a/success'
        }).then(function () {
            return fetchOnce(singleton, {
                url: 'http://this.is/a/success'
            }).then(function () {
                singleton['http://this.is/a/success'].should.not.equal(false);
                done();
            });
        }).catch(done);
    });

    it('should cache for length of cache integer in ms', function (done) {
        nock('http://this.is')
            .get('/a/success')
            .times(1)
            .reply(200, 'success...');

        fetchOnce(singleton, {
            url: 'http://this.is/a/success',
            cache: 20
        }).then(function () {
            return fetchOnce(singleton, {
                url: 'http://this.is/a/success'
            }).then(function () {
                setTimeout(function () {
                    singleton['http://this.is/a/success'].should.equal(false);
                    done();
                }, 30);
            });
        }).catch(done);
    });

    it('should not cache if cache is false', function (done) {
        nock('http://this.is')
            .get('/a/success')
            .times(1)
            .reply(200, 'success...');

        fetchOnce(singleton, {
            url: 'http://this.is/a/success',
            cache: false
        }).then(function () {
            return fetchOnce(singleton, {
                url: 'http://this.is/a/success'
            }).catch(function (err) {
                err.message.should.equal('Nock: No match for request GET http://this.is/a/success ');
                done();
            });
        }).catch(done);
    });
});
