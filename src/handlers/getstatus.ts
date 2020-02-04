import fetch from "node-fetch";

import { GetStatusRequest } from "../types";
import { HttpClient } from "../httpClient";

export const getTxStatusHandle = async (data: GetStatusRequest) => {
  return new Promise((resolve, reject) => {
    if (!("sender" in data) || !("deviceId" in data) || !("txId" in data)) {
      return reject({ statusCode: 400, data: "missing required parameters" });
    }

    const httpClient = new HttpClient();
    return httpClient
      .getTxStatus(data)
      .then((result: any) => {
        return { statusCode: 200, data: result };
      })
      .catch((error: Error) => ({ statusCode: 503, data: error.message }));
  });
};
