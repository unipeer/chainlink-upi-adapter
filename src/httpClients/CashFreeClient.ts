import fetch, { RequestInit } from "node-fetch";

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

export class CashFreeClientClass extends IHttpClient {
  private readonly init: RequestInit;

  /**
   * Creates a new HTTPClient.
   *
   * @param init initializer for requests, defaults to empty.
   */
  constructor(init?: RequestInit) {
    super("cashfree");
    this.init = init || {};
    if (!this.init.headers) {
      this.init.headers = {
        "X-Client-Id": config.BANK.cashfree.appid,
        "X-Client-Secret": config.BANK.cashfree.secret,
      };
    }
  }

  public async collectRequest(body: CollectBody): Promise<CollectResponse> {
    const path = config.BANK.cashfree.url;

    const reqbody = {
      appid: config.BANK.cashfree.appid,
      secretKey: config.BANK.cashfree.secret,
      orderId: body.refId,
      orderAmount: body.amount,
      orderNote: body.note,
      customerName: "Test",
      customerPhone: "9234567890",
      customerEmail: "test@gmail.com",
      returnUrl: "",
      notifyUrl: config.BANK.cashfree.callback_url,
      paymentOption: "upi",
      responseType: "json",
      upi_vpa: body.sender,
      signature: "", // TODO
    };

    let init = this.initMerge({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqbody),
    });

     return fetch(path, init)
      .then(res => res.json())
      .then((result) => {
        console.log(result);
        return {
          success: result.status === "OK",
          refId: result.orderId,
          txId: result.referenceId,
          message: result.message,
        };
      });
  }

  public async getTxStatus(body: GetStatusRequest): Promise<TxStatusResponse> {
    const path = config.BANK.cashfree.verify_url;
    let url = `${path}/orders/${body.txId}/status`

    let init = this.initMerge({
      method: "GET",
    });

    return fetch(url, init)
      .then((res) => res.json())
      .then((result) => {
        console.log(result.txStatus);
        let txstatus: TxStatus = this.parseTxStatus(result.txStatus);

        return {
          success: result.status === "OK",
          txId: body.txId, // or result.referenceId
          txStatus: txstatus,
          txSuccess: txstatus === TxStatus.SUCCESSFUL,
          // Details about the Success/Failure
          message: result.txMsg,
          custRRN: result.utr,
        };
      });
  }

  public async validateVPA(body: ValidateVPARequest): Promise<ValidateVPAResponse> {
    const path = config.BANK.cashfree.verify_url;
    let url = `${path}/upi/validate/${body.vpa}`

    let init = this.initMerge({
      method: "GET",
    });

    return fetch(url, init)
      .then((res) => res.json())
      .then((result) => {
        return {
          success: result.status === "OK",
          valid: result.valid === "True",
          name: result.name
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

export const CashFreeClient = new CashFreeClientClass();
