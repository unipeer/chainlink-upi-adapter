import uuidv1 from "uuid/v1";
import fetch from "node-fetch";

import { CollectRequest } from "../types";
import { HttpClient } from "../httpClient";

export const collectRequestHandle = async (data: CollectRequest) => {
  return new Promise((resolve, reject) => {
    if (!("amount" in data) || !("sender" in data)
        || !("receiver" in data) || !("deviceId" in data)) {
      return reject({ statusCode: 400, data: "missing required parameters" });
    }

    let id = uuidv1();
    const body = {
      txId: id,
      ...data
    };

    console.log(body);

    const httpClient = new HttpClient();
    return httpClient
      .collectRequest(body)
      .then((result: any) => {
        return { statusCode: 200, data: result };
      })
      .catch((error: Error) => ({ statusCode: 503, data: error.message }));
  });
};
