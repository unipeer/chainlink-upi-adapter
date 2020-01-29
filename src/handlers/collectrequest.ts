import uuidv1 from "uuid/v1";
import fetch from "node-fetch";

import { Request } from "../types";
import { HttpClient } from "../httpClient";

export class CollectRequest extends Request {
  amount: string;
  receiver: string;
  currency?: string;
  recipient_type?: string;
  note?: string;
  sender_item_id?: string;
  email_subject?: string;
  email_message?: string;
}

export const collectRequestHandle = async (data: CollectRequest) => {
  return new Promise((resolve, reject) => {
    if (!("amount" in data) || !("receiver" in data)) {
      return reject({ statusCode: 400, data: "missing required parameters" });
    }

    let seqNumber = uuidv1();
    const body = {
      seqNumber
    };

    const httpClient = new HttpClient();
    return httpClient
      .collectRequest(body)
      .then((result: any) => {
        return { statusCode: 200, data: result };
      })
      .catch((error: Error) => ({ statusCode: 503, data: error.message }));
  });
};
