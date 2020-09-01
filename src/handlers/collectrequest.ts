import { v1 as uuidv1 } from 'uuid';
import fetch from "node-fetch";

import { CollectRequest, CollectResponse } from "../types";
import { HttpClient } from "../httpClient";

export const collectRequestHandle = async (data: CollectRequest) => {
  if (!("amount" in data) || !("sender" in data) || !("receiver" in data)) {
    throw { statusCode: 400, data: "missing required parameters" };
  }

  // Some bank API's need a shorter Id
  let id = uuidv1().slice(3);
  const body = {
    refId: id,
    ...data,
  };

  const httpClient = new HttpClient();
  return httpClient
    .collectRequest(body)
    .then((result: CollectResponse) => {
      // If this req is successful, we wait for the callback from the
      // bank else we tell the upstream their req was not successful, passing
      // the error message from the bank.
      if (!result.success) {
        throw { statusCode: 500, data: result.message };
      }

      return {
        statusCode: 201,
        data: {
          status: "pending",
          refId: result.refId,
          txId: result.txId,
          message: result.message,
        },
      };
    })
    .catch((error: Error) => {
      throw { statusCode: 503, data: error };
    });
};
