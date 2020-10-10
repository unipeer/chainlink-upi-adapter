import { v1 as uuidv1 } from "uuid";

import {
  CollectBody,
  GetStatusRequest,
  ValidateVPARequest,
  CollectResponse,
  TxStatus,
  TxStatusResponse,
} from "../types";

import { IHttpClient } from "./IHttpClient";

export class MockClientClass extends IHttpClient {
  /**
   * Creates a new HTTPClient.
   *
   * @param init initializer for requests, defaults to empty.
   */
  constructor() {
    super("mock");
  }

  public async collectRequest(body: CollectBody): Promise<CollectResponse> {
    const txId = uuidv1();
    let res: CollectResponse = {
      success: true,
      refId: txId,
      txId: txId,
      message: "successful",
    };

    if (body.sender == "success@upi") {
      res.status = "success";
    } else if (body.sender == "fail@upi") {
      res.status = "errored";
    }

    return res;
  }

  public async getTxStatus(body: GetStatusRequest): Promise<TxStatusResponse> {
    throw Error("Not implemented!");
  }

  public async validateVPA(body: ValidateVPARequest): Promise<any> {
    throw Error("Not implemented!");
  }
}

export const MockClient = new MockClientClass();
