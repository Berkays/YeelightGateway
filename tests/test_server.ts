// tslint:disable: no-console
// tslint:disable: only-arrow-functions
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import 'mocha';

import app from '../server/app';
const expect = chai.expect;

describe('Api Route Tests', function () {
    let requester: ChaiHttp.Agent;
    before(function () {
        requester = chai.request(app).keepOpen();
    });

    after(function (done: Mocha.Done) {
        requester.close();
        done();
    });

    it('should return list of devices', function (done: Mocha.Done) {
        requester.get('/api/devices/refresh').then(res => {
            expect(res.status).to.eq(200);
            expect(res.body)
                .to.be.an.instanceof(Object)
                .to.have.property('devices');
            expect(res.body.devices).to.be.an.instanceof(Array);
            let deviceCount = res.body.devices.length;
            if (deviceCount > 0) {
                expect(res.body.devices[0]).to.have.property('id');
            }
            else {
                console.warn('No devices found. Skipping some tests.');
            }

            requester.get('/api/devices/').then(res2 => {
                expect(res2.status).to.eq(200);
                expect(res2.body)
                    .to.be.an.instanceof(Object)
                    .to.have.property('devices');
                expect(res2.body.devices).to.be.an.instanceof(Array);
                deviceCount = res2.body.devices.length;
                if (deviceCount > 0) {
                    expect(res2.body.devices[0]).to.have.property('id');
                    expect(res2.body).to.deep.equal(res.body);
                }
            })
                .then(done);
        });
    });
});
