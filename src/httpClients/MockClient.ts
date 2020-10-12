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
      refId: body.refId,
      txId: txId,
      message: "successful",
    };

    // Contrived/kludgy logic to minimise changes in other classes
    // of the server.
    // The status here is picked up by the event bus
    // which updates the jobRunId accordingly on the chainlink node.
    if (body.sender == "success@upi") {
      res.mockResult = true;
    } else if (body.sender == "fail@upi") {
      res.mockResult = false;
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
