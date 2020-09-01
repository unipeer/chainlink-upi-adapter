import {JobRequest, requestWrapper} from './index';
import {Request, CollectRequest, GetStatusRequest} from "./types";
import {assert} from 'chai';
import 'mocha';

describe('create request', () => {
    context('requests data', () => {
        const jobID = "278c97ffadb54a5bbb93cfec5f7b5503";
        const req = <JobRequest>{
            id: jobID,
            data: <Request>{}
        };
        const timeout = 9500;

        it('should fail on invalid method', (done) => {
            // Notice method not set.
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 400, "status code");
                assert.equal(response.status, "errored", "status");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isUndefined(response.data, "response data");
                done();
            });
        });

        let txId = "";

        it('should send Collect Request', (done) => {
            req.data = <CollectRequest>{
                method: "collectRequest",
                amount: process.env.TEST_AMOUNT || 10,
                sender: process.env.TEST_SENDER || "your-buyer@upi",
                receiver: process.env.TEST_RECEIVER || "your-seller@upi"
            };
            requestWrapper(req).then((response) => {
                console.log(response);
                assert.equal(response.statusCode, 201, "status code");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isNotEmpty(response.data, "response data");
                assert.isNotEmpty(response.data.result, "tx id");
                txId = response.data.result;
                done();
            });
        }).timeout(timeout);

        it('should get Tx status details', (done) => {
            req.data = <GetStatusRequest>{
                method: "getStatus",
                sender: process.env.TEST_SENDER || "your-buyer@upi",
                txId: process.env.TEST_TXID || "2ff1fb2a-6c81-4fa1-97f5-892d1934b528",
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 200, "status code");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isNotEmpty(response.data, "response data");
                assert.isNotEmpty(response.data.result, "tx success");
                done();
            });
        }).timeout(timeout);

        it('should get Tx Status details using ENV variable', (done) => {
            process.env.API_METHOD = "getStatus";
            req.data = <Request>{
                method: "collectRequest",
                sender: process.env.TEST_SENDER || "your-buyer@upi",
                txId: process.env.TEST_TXID || "2ff1fb2a-6c81-4fa1-97f5-892d1934b528",
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 200, "status code");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isNotEmpty(response.data, "response data");
                assert.isNotEmpty(response.data.result, "tx success");
                done();
            });
        }).timeout(timeout);

        it('should fail collectRequest with missing amount', (done) => {
            req.data = <CollectRequest>{
                method: "collectRequest",
                receiver: "your-buyer@example.com"
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 400, "status code");
                assert.equal(response.status, "errored", "status");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isUndefined(response.data, "response data");
                done();
            });
        }).timeout(timeout);

        it('should fail collectRequest with missing receiver', (done) => {
            req.data = <Request>{
                method: "collectRequest",
                amount: 10
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 400, "status code");
                assert.equal(response.status, "errored", "status");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isUndefined(response.data, "response data");
                done();
            });
        }).timeout(timeout);

        it('should fail getStatus with missing transaction id', (done) => {
            req.data = <GetStatusRequest>{
                method: "getStatus"
            };
            requestWrapper(req).then((response) => {
                assert.equal(response.statusCode, 400, "status code");
                assert.equal(response.status, "errored", "status");
                assert.equal(response.jobRunID, jobID, "job id");
                assert.isUndefined(response.data, "response data");
                done();
            });
        }).timeout(timeout);
    })
});
