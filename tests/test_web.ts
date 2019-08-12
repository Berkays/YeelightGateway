// tslint:disable: no-console
// tslint:disable: only-arrow-functions
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import 'mocha';

import app from '../server/app';
const expect = chai.expect;

describe('Web Frontend Tests', function () {
    let requester: ChaiHttp.Agent;
    before(function () {
        requester = chai.request(app).keepOpen();
    });

    after(function (done: Mocha.Done) {
        requester.close();
        done();
    });

    it('should return web content', function (done: Mocha.Done) {
        requester.get('/').then(res => {
            expect(res.status).to.eq(200);
            // tslint:disable-next-line: max-line-length
            const expectedText = '<!DOCTYPE html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"><title>Yeelight Gateway</title><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"><script async="" defer="" src="https://buttons.github.io/buttons.js"></script>';
            expect(res.text).to.include(expectedText);
        }).then(done);
    });
});
