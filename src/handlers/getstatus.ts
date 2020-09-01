import fetch from "node-fetch";

import { GetStatusRequest, TxStatusResponse } from "../types";
import { HttpClient } from "../httpClient";

export const getTxStatusHandle = async (data: GetStatusRequest) => {
  if (!("txId" in data)) {
    throw { statusCode: 400, data: "missing required parameters" };
  }

  const httpClient = new HttpClient();
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
