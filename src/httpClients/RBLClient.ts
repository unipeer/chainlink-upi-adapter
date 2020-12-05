import fetch, { RequestInit } from "node-fetch";
import * as js2xml from "js2xmlparser";
import xmlParser from "xml2json";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { StatusCodes } from "http-status-codes";

import config from "../config";

import {
  CollectBody,
  GetStatusRequest,
  ValidateVPARequest,
  ValidateVPAResponse,
  CollectResponse,
  TxStatus,
  TxStatusResponse,
} from "../types";

import { IHttpClient } from "./IHttpClient";

class SessionParams {
  session: string;
}

class AuthTokenParams extends SessionParams {
  auth: string;
}

class TxIdParams extends AuthTokenParams {
  txId: string;
}

export class RBLClientClass extends IHttpClient {
  private readonly init: RequestInit;
  private readonly path = config.BANK.rbl.url;

  /**
   * Creates a new HTTPClient.
   *
   * @param init initializer for requests, defaults to empty.
   */
  constructor(init?: RequestInit) {
    super("rbl");
    this.init = init || {};
    if (!this.init.headers) {
      this.init.headers = {
        Authorization: config.BANK.rbl.auth,
      };
    }
    dayjs.extend(utc);
    dayjs.extend(timezone);
  }

  private async login(): Promise<SessionParams> {
    let reqBody = {
      username: config.BANK.rbl.username,
      password: config.BANK.rbl.password,
      bcagent: config.BANK.rbl.bcagent,
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
          throw {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: result.description,
          };
        }
        return { session: result.sessiontoken };
      });
  }

  private async getAuthToken(params: SessionParams): Promise<AuthTokenParams> {
    let reqBody = {
      header: {
        sessiontoken: params.session,
        bcagent: config.BANK.rbl.bcagent,
      },
      mrchOrgId: config.BANK.rbl.mrchOrgId,
      aggrOrgId: config.BANK.rbl.aggrOrgId,
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
      hmac: "bOv12oiym0fecOwyrH0J+g==",
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
          throw {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: result.description,
          };
        }
        return { auth: result.token, ...params };
      });
  }

  private async getTxId(params: AuthTokenParams): Promise<TxIdParams> {
    let reqBody = {
      header: {
        sessiontoken: params.session,
        bcagent: config.BANK.rbl.bcagent,
      },
      mrchOrgId: config.BANK.rbl.mrchOrgId,
      aggrOrgId: config.BANK.rbl.aggrOrgId,
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
          throw {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: result.description,
          };
        }
        return { txId: result.txnId, ...params };
      });
  }

  public async collectRequest(body: CollectBody): Promise<CollectResponse> {
    let expire = dayjs()
      .tz("Asia/Kolkata")
      .add(config.PAY_TIMEOUT_MINS, "minute")
      .format("YYYY-MM-DD HH:mm:ss");

    let getBody = (params: TxIdParams) => ({
      header: {
        sessiontoken: params.session,
        bcagent: config.BANK.rbl.bcagent,
      },
      mrchOrgId: config.BANK.rbl.mrchOrgId,
      aggrOrgId: config.BANK.rbl.aggrOrgId,
      note: body.note,
      validupto: expire,
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

  public async getTxStatus(body: GetStatusRequest): Promise<TxStatusResponse> {
    let getBody = (params: AuthTokenParams) => ({
      header: {
        sessiontoken: params.session,
        bcagent: config.BANK.rbl.bcagent,
      },
      mrchOrgId: config.BANK.rbl.mrchOrgId,
      aggrOrgId: config.BANK.rbl.aggrOrgId,
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
        let result: any = Object.entries(res)[0][1];
        let txstatus: TxStatus = this.parseTxStatus(result.txnstatus);

        return {
          success: result.status == 1,
          txId: body.txId as string,
          txStatus: txstatus,
          txSuccess: txstatus === TxStatus.SUCCESSFUL,
          // Details about the Success/Failure
          message:
            Object.keys(result.txnerrorcode).length !== 0
              ? result.txnerrorcode
              : result.txnstatus,
          custRRN: result.custref,
        };
      });
  }

  public async validateVPA(body: ValidateVPARequest): Promise<ValidateVPAResponse> {
    let getBody = (params: AuthTokenParams) => ({
      header: {
        sessiontoken: params.session,
        bcagent: config.BANK.rbl.bcagent,
      },
      mrchOrgId: config.BANK.rbl.mrchOrgId,
      aggrOrgId: config.BANK.rbl.aggrOrgId,
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
          valid: result.status == 1,
          name: result.description,
        };
      });
  }

  /**
   * Adapt the txstatus of the txId
   * to the TxStatus enum.
   *
   */
  private parseTxStatus(txnstatus: string): TxStatus {
    let status = TxStatus.FAILED;
    if (!txnstatus || txnstatus.length == 0) return status;

    switch (txnstatus.toLowerCase()) {
      case "success":
        status = TxStatus.SUCCESSFUL;
        break;
      case "failure":
        status = TxStatus.FAILED;
        break;
      case "in progress":
        status = TxStatus.PENDING;
        break;
    }

    return status;
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

export const RBLClient = new RBLClientClass();
