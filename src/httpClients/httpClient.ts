import fetch, { Headers, RequestInit, Response } from "node-fetch";
import * as js2xml from "js2xmlparser";
import xmlParser from "xml2json";

import config from "../config";

import {
  CollectBody,
  GetStatusRequest,
  ValidateVPARequest,
  CollectResponse,
  TxStatusResponse,
} from "../types";

class SessionParams {
  session: string;
}

class AuthTokenParams extends SessionParams {
  auth: string;
}

class TxIdParams extends AuthTokenParams {
  txId: string;
}

export class HTTPClient {
  private readonly init: RequestInit;
  private readonly path = config.BANK.rbl.url;

  /**
   * Creates a new HTTPClient.
   *
   * @param url required, the base url of all requests.
   * @param init initializer for requests, defaults to empty.
   * @param cache cache storage for requests, defaults to global.
   */
  constructor(init?: RequestInit) {
    this.init = init || {};
    if (!this.init.headers) {
      this.init.headers = {
        Authorization: config.BANK.rbl.auth,
      };
    }
  }

  private async login(): Promise<SessionParams> {
    let reqBody = {
      username: "RkicksUser",
      password: "8D44DAAE2F0C6F2F1952EC1C1DA1B967F5F94889",
      bcagent: "Rki2160863",
    };

    let init = this.initMerge({
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
      },
      body: js2xml.parse("channelpartnerloginreq", reqBody),
    });

    return fetch(this.path, init)
      .then((res) => res.text())
      .then((res) => xmlParser.toJson(res, { object: true }))
      .then((res) => {
        let result: any = Object.entries(res)[0][1];
        if (result.status === "0") {
          throw { statusCode: 500, data: result.description };
        }
        return { session: result.sessiontoken };
      });
  }

  private async getAuthToken(params: SessionParams): Promise<AuthTokenParams> {
    let reqBody = {
      header: {
        sessiontoken: params.session,
        bcagent: "Rki2160863",
      },
      mrchOrgId: "rkicks",
      aggrOrgId: "rkicks",
      note: "nothing",
      refId: "124223411245699",
      refUrl: "http://google.com",
      mobile: "1234567890",
      geocode: "1.23",
      location: "India",
      ip: "1.1.1.1",
      type: "MOB",
      id: "sdfa",
      os: "Android",
      app: "com.rblbank.mobank",
      capability: "100",
      hmac: "JiSKgtw6E2s88OJmd25GQQ==",
    };

    let init = this.initMerge({
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
      },
      body: js2xml.parse("generateauthtokenreq", reqBody),
    });

    return fetch(this.path, init)
      .then((res) => res.text())
      .then((res) => xmlParser.toJson(res, { object: true }))
      .then((res) => {
        let result: any = Object.entries(res)[0][1];
        if (result.status === "0") {
          throw { statusCode: 500, data: result.description };
        }
        return { auth: result.token, ...params };
      });
  }

  private async getTxId(params: AuthTokenParams): Promise<TxIdParams> {
    let reqBody = {
      header: {
        sessiontoken: params.session,
        bcagent: "Rki2160863",
      },
      mrchOrgId: "rkicks",
      aggrOrgId: "rkicks",
      mobile: "1234567890",
      geocode: "1.23",
      location: "India",
      ip: "1.1.1.1",
      type: "MOB",
      id: "sdfa",
      os: "Android",
      app: "com.rblbank.mobank",
      capability: "100",
      hmac: params.auth,
    };

    let init = this.initMerge({
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
      },
      body: js2xml.parse("gettxnid", reqBody),
    });

    return fetch(this.path, init)
      .then((res) => res.text())
      .then((res) => xmlParser.toJson(res, { object: true }))
      .then((res) => {
        let result: any = Object.entries(res)[0][1];
        if (result.status === "0") {
          throw { statusCode: 500, data: result.description };
        }
        return { txId: result.txnId, ...params };
      });
  }

  /**
   * Request to start a payment request from the sender to a receiver
   * with the amount via their UPI Virtual Addresses.
   *
   * The sender must approve the request from their UPI App
   * by confirming the Tx and entering their MPIN.
   *
   * @param body required, the request body as an object.
   */
  public async collectRequest(body: CollectBody): Promise<CollectResponse> {
    let getBody = (params: TxIdParams) => ({
      header: {
        sessiontoken: params.session,
        bcagent: "Rki2160863",
      },
      mrchOrgId: "rkicks",
      aggrOrgId: "rkicks",
      note: body.note,
      validupto: "2020-10-08 00:00:00",
      refId: body.refId,
      refUrl: "http://google.com",
      orgTxnId: params.txId,
      txnId: params.txId,
      mobile: "9234567890",
      geocode: "34.7273,74.8278",
      location: "India",
      ip: "192.68.0.12",
      type: "MOB",
      id: "sdfa",
      os: "Android",
      app: "com.rblbank.mobank",
      capability: "100",
      hmac: params.auth,
      payeraddress: body.sender,
      payername: body.sender,
      payeeaddress: body.receiver,
      payeename: body.receiver,
      amount: body.amount,
    });

    return this.login()
      .then((res) => this.getAuthToken({ session: res.session }))
      .then((res) => this.getTxId({ session: res.session, auth: res.auth }))
      .then((res) => {
        let init = this.initMerge({
          method: "POST",
          headers: {
            "Content-Type": "application/xml",
          },
          body: js2xml.parse("collectrequest", getBody(res)),
        });

        return fetch(this.path, init);
      })
      .then((res) => res.text())
      .then((res) => xmlParser.toJson(res, { object: true }))
      .then((res) => {
        let result: any = Object.entries(res)[0][1];
        return {
          success: result.status == 1,
          refId: body.refId,
          txId: result.txnid as string,
          message: result.description as string,
        };
      });
  }

  /**
   * Request to confirm the status of a payment transaction
   * associated with the `body.txId`.
   *
   * This API should only be called after a collect request
   * has expired and no HTTP callback for the txId was received.
   *
   * @param body required, the request body as an object.
   */
  public async getTxStatus(body: GetStatusRequest): Promise<TxStatusResponse> {
    let getBody = (params: AuthTokenParams) => ({
      header: {
        sessiontoken: params.session,
        bcagent: "Rki2160863",
      },
      mrchOrgId: "rkicks",
      aggrOrgId: "rkicks",
      mobile: "9234567890",
      geocode: "34.7273,74.8278",
      location: "India",
      ip: "192.68.0.12",
      type: "MOB",
      id: "sdfa",
      os: "Android",
      app: "com.rblbank.mobank",
      capability: "100",
      hmac: params.auth,
      orgTxnIdorrefId: body.txId,
      flag: 0,
    });

    return this.login()
      .then((res) => this.getAuthToken({ session: res.session }))
      .then((res) => {
        let init = this.initMerge({
          method: "POST",
          headers: {
            "Content-Type": "application/xml",
          },
          body: js2xml.parse("searchrequest", getBody(res)),
        });

        return fetch(this.path, init);
      })
      .then((res) => res.text())
      .then((res) => xmlParser.toJson(res, { object: true }))
      .then((res) => {
        let txstatus: string;
        let result: any = Object.entries(res)[0][1];

        // Adapt the txstatus of the txId
        switch (result.txnstatus.toLowerCase()) {
          case "success":
            txstatus = "success";
            break;
          case "failure":
            txstatus = "errored";
            break;
          case "in progress":
            txstatus = "pending";
            break;
        }

        return {
          success: result.status == 1,
          txId: body.txId as string,
          txStatus: txstatus,
          // Success /Failure/ In Progress
          message: result.txnstatus as string,
          sender: result.payeraddr,
          receiver: result.payeeaddr,
          custRRN: result.custref,
        };
      });
  }

  /**
   * API to confirm an user entered UPI Id or
   * VPA (Virtual Payment Address) is valid or not.
   *
   * This should not be used through a contract but
   * is provided though the same oracle to completeness.
   *
   * Oracle owner can call this API through external auth
   * or by via a web/external initiator as part of chainlink framework.
   *
   * @param body required, the request body as an object.
   */
  public async validateVPA(body: ValidateVPARequest): Promise<any> {
    let getBody = (params: AuthTokenParams) => ({
      header: {
        sessiontoken: params.session,
        bcagent: "Rki2160863",
      },
      mrchOrgId: "rkicks",
      aggrOrgId: "rkicks",
      note: "nothing",
      refId: body.refId,
      orgTxnId: body.refId,
      refUrl: "http://google.com",
      mobile: "9234567890",
      geocode: "34.7273,74.8278",
      location: "India",
      ip: "192.68.0.12",
      type: "MOB",
      id: "sdfa",
      os: "Android",
      app: "com.rblbank.mobank",
      capability: "100",
      hmac: params.auth,
      addr: body.vpa,
    });

    return this.login()
      .then((res) => this.getAuthToken({ session: res.session }))
      .then((res) => {
        let init = this.initMerge({
          method: "POST",
          headers: {
            "Content-Type": "application/xml",
          },
          body: js2xml.parse("validatevpa", getBody(res)),
        });

        return fetch(this.path, init);
      })
      .then((res) => res.text())
      .then((res) => xmlParser.toJson(res, { object: true }))
      .then((res) => {
        let result: any = Object.entries(res)[0][1];

        return {
          // Here status returned is of VPA not API. :/
          success: result.status == 1,
          message: result.description as string,
          refId: body.refId,
        };
      });
  }

  /**
   * Creates a new RequestInit for requests.
   *
   * @param init the initializer to merge into the client initializer.
   */
  private initMerge(init?: RequestInit): RequestInit {
    init = Object.assign({ headers: {} }, init || {});

    for (var kv of Object.entries(this.init.headers)) {
      (init.headers as { [key: string]: string })[kv[0]] = kv[1];
    }

    return Object.assign(init, this.init);
  }
}
