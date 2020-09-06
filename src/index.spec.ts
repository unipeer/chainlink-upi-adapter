import { JobRequest, requestWrapper } from "./index";
import {
  Request,
  CollectRequest,
  GetStatusRequest,
  ValidateVPARequest,
} from "./types";
import { assert, expect } from "chai";
import "mocha";

describe("UPI 2.0 API Adapter", () => {
  const timeout = 25000;
  const jobID = "278c97ffadb54a5bbb93cfec5f7b5503";
  const req = <JobRequest>{
    id: jobID,
    data: <Request>{},
  };

  let txId = "";

  context("common", () => {
    it("should fail on invalid method", (done) => {
      // Notice method not set.
      requestWrapper(req).then((response) => {
        assert.equal(response.statusCode, 400, "status code");
        assert.equal(response.status, "errored", "status");
        assert.equal(response.jobRunID, jobID, "job id");
        assert.isUndefined(response.data, "response data");
        done();
      });
    });
  });

  context("Collect Request", () => {
    it("should send Collect Request", (done) => {
      req.data = <CollectRequest>{
        method: "collectRequest",
        amount: process.env.TEST_AMOUNT || 10,
        sender: process.env.TEST_SENDER || "your-buyer@upi",
        receiver: process.env.TEST_RECEIVER || "your-seller@upi",
      };
      requestWrapper(req)
        .then((response) => {
          assert.equal(response.statusCode, 201, "status code");
          assert.equal(response.jobRunID, jobID, "job id");
          assert.equal(response.status, "pending", "status");
          assert.isNotEmpty(response.data, "response data");
          assert.isNotEmpty(response.data.result, "tx id");
          txId = response.data.result;
          done();
        })
        .catch((err) => done(err));
    }).timeout(timeout);

    it("should fail collectRequest with missing amount", (done) => {
      req.data = <CollectRequest>{
        method: "collectRequest",
        receiver: "your-buyer@example.com",
      };
      requestWrapper(req)
        .then((response) => {
          assert.equal(response.statusCode, 400, "status code");
          assert.equal(response.status, "errored", "status");
          assert.equal(response.jobRunID, jobID, "job id");
          assert.isUndefined(response.data, "response data");
          done();
        })
        .catch((err) => done(err));
    }).timeout(timeout);

    it("should fail collectRequest with missing receiver", (done) => {
      req.data = <Request>{
        method: "collectRequest",
        amount: 10,
      };
      requestWrapper(req)
        .then((response) => {
          assert.equal(response.statusCode, 400, "status code");
          assert.equal(response.status, "errored", "status");
          assert.equal(response.jobRunID, jobID, "job id");
          assert.isUndefined(response.data, "response data");
          done();
        })
        .catch((err) => done(err));
    }).timeout(timeout);
  });

  context("Tx Status", () => {
    it("should get Tx status details", (done) => {
      req.data = <GetStatusRequest>{
        method: "getStatus",
        txId: process.env.TEST_TXID || txId,
      };
      requestWrapper(req)
        .then((response) => {
          assert.equal(response.statusCode, 200, "status code");
          assert.equal(response.jobRunID, jobID, "job id");
          expect(["success", "pending", "errored"], "status").to.include(
            response.status
          );
          assert.isNotEmpty(response.data, "response data");
          assert.isNotEmpty(response.data.result, "tx success");
          done();
        })
        .catch((err) => done(err));
    }).timeout(timeout);

    it("should get Tx Status details using ENV variable", (done) => {
      process.env.API_METHOD = "getStatus";
      req.data = <Request>{
        method: "collectRequest",
        txId: process.env.TEST_TXID || "RNB22a90175ae2e43e7b21fd3ebcdb2dc14",
      };
      requestWrapper(req)
        .then((response) => {
          process.env.API_METHOD = "";
          assert.equal(response.statusCode, 200, "status code");
          assert.equal(response.jobRunID, jobID, "job id");
          expect(["success", "pending", "errored"], "status").to.include(
            response.status
          );
          assert.isNotEmpty(response.data, "response data");
          assert.isNotEmpty(response.data.result, "tx success");
          done();
        })
        .catch((err) => done(err));
    }).timeout(timeout);

    it("should fail getStatus with missing transaction id", (done) => {
      req.data = <GetStatusRequest>{
        method: "getStatus",
      };
      requestWrapper(req)
        .then((response) => {
          assert.equal(response.statusCode, 400, "status code");
          assert.equal(response.status, "errored", "status");
          assert.equal(response.jobRunID, jobID, "job id");
          assert.isUndefined(response.data, "response data");
          done();
        })
        .catch((err) => done(err));
    }).timeout(timeout);
  });

  context("Validate VPA", () => {
    it("should be able to validate a UPI VPA correctly", (done) => {
      req.data = <ValidateVPARequest>{
        method: "validatevpa",
        vpa: process.env.TEST_VPA || "rkicksbcagent@rbl",
      };
      requestWrapper(req)
        .then((response) => {
          assert.equal(response.statusCode, 200, "status code");
          assert.equal(response.jobRunID, jobID, "job id");
          assert.equal(response.status, "success", "status");
          assert.equal(response.data.result, true, "vpa status");
          assert.isNotEmpty(response.data, "response data");
          assert.isNotEmpty(response.data.refId, "ref Id");
          done();
        })
        .catch((err) => done(err));
    }).timeout(timeout);

    it("should report an invalid VPA", (done) => {
      req.data = <ValidateVPARequest>{
        method: "validatevpa",
        vpa: process.env.TEST_VPA || "test-id@upi",
      };
      requestWrapper(req)
        .then((response) => {
          assert.equal(response.statusCode, 200, "status code");
          assert.equal(response.jobRunID, jobID, "job id");
          assert.equal(response.status, "success", "status");
          assert.equal(response.data.result, false, "vpa status");
          assert.isNotEmpty(response.data, "response data");
          assert.isNotEmpty(response.data.refId, "ref Id");
          done();
        })
        .catch((err) => done(err));
    }).timeout(timeout);
  });
});
