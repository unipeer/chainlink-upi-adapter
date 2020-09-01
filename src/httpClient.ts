import fetch, { Headers, RequestInit, Response } from "node-fetch";
import URL from "url";
import * as js2xml from "js2xmlparser";
import xmlParser from "xml2json";

import { CollectBody, GetStatusRequest, CollectResponse } from "./types";

export class HttpClient {
  private readonly init: RequestInit;

  /**
   * Creates a new HttpClient.
   *
   * @param url required, the base url of all requests.
   * @param init initializer for requests, defaults to empty.
   * @param cache cache storage for requests, defaults to global.
   */
  constructor(init?: RequestInit) {
    this.init = init || {};
    if (!this.init.headers) {
      this.init.headers = {
        Authorization:
          "Basic YWRtaW46ZWloZWVoNFJpZTdZZW5hUDlhZWNoNkl0aGlleTFlZW0=",
      };
    }
  }

  private async login(): Promise<{ session: string }> {
    let path = "https://proxy.unipeer.exchange/rbl";

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

    return fetch(path, init)
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

  private async getAuthToken(
    session: string
  ): Promise<{ session: string; auth: string }> {
    let path = "https://proxy.unipeer.exchange/rbl";

    let reqBody = {
      header: {
        sessiontoken: session,
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

    return fetch(path, init)
      .then((res) => res.text())
      .then((res) => xmlParser.toJson(res, { object: true }))
      .then((res) => {
        let result: any = Object.entries(res)[0][1];
        if (result.status === "0") {
          throw { statusCode: 500, data: result.description };
        }
        return { session: session, auth: result.token };
      });
  }

  private async getTxId(
    session: string,
    auth: string
  ): Promise<{ session: string; auth: string; txId: string }> {
    let path = "https://proxy.unipeer.exchange/rbl";

    let reqBody = {
      header: {
        sessiontoken: session,
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
      hmac: auth,
    };

    let init = this.initMerge({
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
      },
      body: js2xml.parse("gettxnid", reqBody),
    });

    return fetch(path, init)
      .then((res) => res.text())
      .then((res) => xmlParser.toJson(res, { object: true }))
      .then((res) => {
        let result: any = Object.entries(res)[0][1];
        if (result.status === "0") {
          throw { statusCode: 500, data: result.description };
        }
        return { session: session, auth: auth, txId: result.txnId };
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
    let path = "https://proxy.unipeer.exchange/rbl";

    let getBody = (res: { session: string; auth: string; txId: string }) => ({
      header: {
        sessiontoken: res.session,
        bcagent: "Rki2160863",
      },
      mrchOrgId: "rkicks",
      aggrOrgId: "rkicks",
      note: body.note,
      validupto: "2020-10-05 00:00:00",
      refId: body.refId,
      refUrl: "http://google.com",
      orgTxnId: res.txId,
      txnId: res.txId,
      mobile: "9234567890",
      geocode: "34.7273,74.8278",
      location: "India",
      ip: "192.68.0.12",
      type: "MOB",
      id: "sdfa",
      os: "Android",
      app: "com.rblbank.mobank",
      capability: "100",
      hmac: res.auth,
      payeraddress: body.sender,
      payername: body.sender,
      payeeaddress: body.receiver,
      payeename: body.receiver,
      amount: body.amount,
    });

    return this.login()
      .then((res) => this.getAuthToken(res.session))
      .then((res) => this.getTxId(res.session, res.auth))
      .then((res) => {
        let init = this.initMerge({
          method: "POST",
          headers: {
            "Content-Type": "application/xml",
          },
          body: js2xml.parse("collectrequest", getBody(res)),
        });

        return fetch(path, init);
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
   * @param body required, the request body as an object.
   */
  public async getTxStatus(body: GetStatusRequest): Promise<Response> {
    let path =
      "https://developerapi.icicibank.com:8443/api/v0/upi2/TransactionStatus";

    let reqBody = {
      profileId: "10",
      MobileNumber: "902890XXXX",
      VirtualAddress: body.sender,
      deviceId: body.deviceId,
      seqNumber: body.txId,
      channelcode: "ImoXXXX",
      payeename: "",
    };

    let init = this.initMerge({
      method: "POST",
      body: JSON.stringify(reqBody),
    });

    return fetch(path, init);
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
