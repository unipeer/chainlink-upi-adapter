import { v1 as uuidv1 } from "uuid";
import fetch from "node-fetch";

import { CollectRequest, CollectResponse } from "../types";
import { HttpClient } from "../httpClients";
import { Event, TxEvent } from "../event";

export const collectRequestHandle = async (
  jobRunId: string,
  data: CollectRequest,
  httpClient = HttpClient,
) => {
  if (!("amount" in data) || !("sender" in data) || !("receiver" in data)) {
    throw { statusCode: 400, data: "missing required parameters" };
  }

  // Use the Chainlink Job Id as ref
  // so that we know the Job to update during the HTTP callback.
  const body = {
    refId: jobRunId,
    ...data,
  };

  return httpClient
    .collectRequest(body)
    .then((result: CollectResponse) => {
      // If this req is successful, we wait for the callback from the
      // bank else we tell the upstream their req was not successful, passing
      // the error message from the bank.
      if (!result.success) {
        throw { statusCode: 500, data: result.message };
      }

      Event.collectEvent.emit("start", <TxEvent>{ txId: result.txId, jobRunId: result.refId });

      return {
        statusCode: 201,
        data: {
          status: "pending",
          ...result,
        },
      };
    })
    .catch((error: Error) => {
      throw { statusCode: 503, data: error };
    });
};
