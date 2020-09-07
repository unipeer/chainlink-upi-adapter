import fetch from "node-fetch";

import config from "../config";
import { HTTPCallbackClass } from "../httpClients";

export const callbackHandle = async (req: any, res: any) => {
  const httpCallback = new HTTPCallbackClass();
  return httpCallback
    .processCallback(req.body)
    .then((result) => {
      console.log(result);

      fetch(config.NODE_URL + `/v2/runs/${result.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": config.NODE_AUTH,
        },
        body: JSON.stringify({
          id: result.id,
          data: { result: result.txstatus }, // Payment made successfully or not
          pending: false
        }),
      })
        .catch((e) => console.log(e))
        .finally(() => res.type(result.type).status(result.statusCode).send(result.body));
    })
    .catch(({ statusCode, type, body}) => {
      res.type(type).status(statusCode).send(body);
    });
};
