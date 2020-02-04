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
        return { statusCode: 201, data: result };
      })
      .catch((error: Error) => ({ statusCode: 503, data: error.message }));
};
