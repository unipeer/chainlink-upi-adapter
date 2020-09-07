import fetch from "node-fetch";

import { GetStatusRequest, TxStatusResponse } from "../types";
import { HTTPClient } from "../httpClients";

export const getTxStatusHandle = async (
  httpClient: HTTPClient,
  data: GetStatusRequest
) => {
  if (!("txId" in data)) {
    throw { statusCode: 400, data: "missing required parameters" };
  }

  return httpClient
    .getTxStatus(data)
    .then((result: TxStatusResponse) => {
      if (!result.success) {
        throw { statusCode: 500, data: result.message };
      }

      return {
        statusCode: 200,
        data: result,
      };
    })
    .catch((error: Error) => {
      throw { statusCode: 503, data: error.message };
    });
};
