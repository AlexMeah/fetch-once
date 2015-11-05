var proxyquire = require('proxyquire').noCallThru();
var nock = require('nock');
require('chai').should();

require('es6-promise').polyfill();

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

        Promise.all([
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
            successHandler: function (resp) {
                resp.status.should.equal(500);
                resp.data.should.equal('never...');

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
            axios: function () {
                return Promise.reject(new Error('fail'));
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
                err.message.should.equal('Nock: No match for request get http://this.is/a/success ');
                done();
            });
        }).catch(done);
    });
});
