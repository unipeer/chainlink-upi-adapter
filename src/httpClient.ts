import fetch, { Headers, RequestInit, Response } from "node-fetch";
import URL from "url";

import { CollectBody, GetStatusRequest } from "./types";

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
        apikey: "l7xx57b7cb6715d447a8ac67ee01b1d87914"
      };
    }
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
  public async collectRequest(body: CollectBody): Promise<Response> {
    let path =
      "https://developerapi.icicibank.com:8443/api/v0/upi1/collectrequest";

    let reqBody = {
      ProfileId: "10",
      AccountProvider: "5",
      Payeeva: body.receiver,
      Payerva: body.sender,
      Amount: body.amount,
      DeviceId: body.deviceId,
      seqNumber: body.txId,
      Note: body.note || "",
      Channelcode: "IMobileNumber",
      Expireafter: "10"
    };

    let init = this.initMerge({
      method: "POST",
      body: JSON.stringify(reqBody)
    });

    return fetch(path, init);
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
      payeename: ""
    };

    let init = this.initMerge({
      method: "POST",
      body: JSON.stringify(reqBody)
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
