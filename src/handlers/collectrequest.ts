import uuidv1 from "uuid/v1";
import fetch from "node-fetch";

import { CollectRequest } from "../types";
import { HttpClient } from "../httpClient";

export const collectRequestHandle = async (data: CollectRequest) => {
    if (!("amount" in data) || !("sender" in data)
        || !("receiver" in data) || !("deviceId" in data)) {
      throw { statusCode: 400, data: "missing required parameters" };
    }

    let id = uuidv1();
    const body = {
      txId: id,
      ...data
    };

    const httpClient = new HttpClient();
    return httpClient
      .collectRequest(body)
      .then(result => result.json())
      .then((result: any) => {
          // If this req is successful, we wait for the callback from the
          // bank else we tell the upstream their req was not successful, passing
          // the error message from the bank.
          if (!result.success) {
            return { statusCode: 501, data: {
                status: "errored",
                ...result
            }};
          } else {
            return { statusCode: 201, data: {
              status: "pending",
              txId: result.SeqNo,
              BankRRN: result.BankRRN,
              success: result.success, // Whether the Tx was successful or not.
              response: result.response, // Details about the success/error
              message: result.message, // Details about the success/error
            }};
          }
      })
      .catch((error: Error) => ({ statusCode: 503, data: error }));
};
