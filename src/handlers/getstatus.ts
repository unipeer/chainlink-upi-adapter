import fetch from "node-fetch";

import { GetStatusRequest } from "../types";
import { HttpClient } from "../httpClient";

export const getTxStatusHandle = async (data: GetStatusRequest) => {
    if (!("sender" in data) || !("deviceId" in data) || !("txId" in data)) {
      throw { statusCode: 400, data: "missing required parameters" };
    }

    const httpClient = new HttpClient();
    return httpClient
      .getTxStatus(data)
      .then(result => result.json())
      .then((result: any) => {
        return { statusCode: 200, data: result };
      })
      .catch((error: Error) => ({ statusCode: 503, data: error.message }));
};
