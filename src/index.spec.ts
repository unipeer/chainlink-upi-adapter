import chai, { assert, expect } from "chai";
import chaiHttp from "chai-http";
import "mocha";

import { JobRequest, requestWrapper } from "./index";
import {
  Request,
  CollectRequest,
  GetStatusRequest,
  ValidateVPARequest,
} from "./types";
import app from "./app";

describe("UPI 2.0 API Adapter", () => {
  chai.use(chaiHttp);

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
        vpa: process.env.TEST_VPA || "riya49@rbl",
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

  context("Callback", () => {
    it("should be able to correctly verify a callback", (done) => {
      let body = "<data>tguAVbKouaWkAIqh6p4EIMVsj6VJ7LHwRT+O+BboiOdKKSPQhRiJdWp/jI7YKG4t5GdLFuPVvDIfIziCjw3EorgsRUpUE+Yc3yVQgXNZLSaWUVU4DJa7qjHQNmw+3z0fY6+f7j2DKBUvitXXTf+jbhyd1ziam93dAzEBAEfLpFac09tkRLV6o8aLOboY9YMAOFi+MLciY8MxC2FFl3BSwEz0IASwZE6HvASHQOr482ql+B7/e/RKaSnNJL+tA+igZv8WFf8UVWJxcC3T/pz0ZshtBz+Wi9Xam+msCKmf+qNLZzj4PpMgOeklyf5aF3olTu+yFv1QiKUO5AtgGb6jVdAOWJyG4ZluDpx7JyVdhdeiqoCrmtGdtyTD+KkFtMxLqP4jdvOticZmxnlQxfNYbaGneuK8LUxKd0Wjr+o0N/6KeTrJRBu2k1uWgyI4xqvOzRzOYZrz5lvfIyxX/ibKfBHzdaEeYYkde9oEbxHmPgpYUDlkxI9e+vlodstGJWgSasq3e6cHhrpxtqR+NBwlEuN7PoV0bQYXdXSIxcySIp0cC6nl5HgrZMQTe3GjCAsvFKQhO25vJZpRyK6jALB+qhmo8WtGVwTY//bENL9BHVFhr1qp3iFB6fjRJRgVtdxFRf/88Qp9WFT5n8vK5XHXGqWmPdVIEwWlxYKuJP9lvnkOmeXTjM4Wy6MhiN65JQXdMw+F0HnEKPjVQM/UXcz9j7lo52RoSGj6R8Pv5uqYJXXjNL+mQN7cwg71mtH+0RxD/+vpfaGXxNzpts7q5blrq+VX8mYN+/8HO6Ays3tLl+8P+rDAe1axaRUymvkpYIvtKOdIorNWYbfD/GaZQOeseN3g85BjSxVlI8B+8VcpocjI+qVzJwX2x3ObIYYCzBFGzKxdXok7ppP+4/H3b0EDnYD0JMVawwVOzK9AKnOc/FuED/bKdN4U3wb7YHDww7d1h7Hmuug2ZL6skez8gKuH+Pm9THpOt8BCzo7JozOTXJCOP0IhI0n40oHinoJT09CJWZiaTpEJAflDy9uri2uIdQq+0w1DIs0WyubByiccETOjlCcB0PtCRhFIAAsnESEO7p37D98awcKgl38B8BA2ns62PcWk5v2eVNO5AAWGbUboxkKGLsIkpZ3hkhrsavTtQQeaUdRit/o3YFCbd2YXwZAe7NGFqy5TvtvnxzLDjo/OgLog6EpY6bebRzASvBd6WkZ5ETrkqg/pk2sD8GIbQg==</data>";

        chai.request(app).post("/callback/rbl")
        .type("application/xml")
        .send(body)
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done(err);
        })
    }).timeout(timeout);
  });

});
