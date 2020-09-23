import fetch from "node-fetch";

import config from "../config";
import { HttpCallback, ChainlinkHttpClient } from "../httpClients";
import { Event, TxEvent } from "../event";

export const callbackHandle = async (req: any, res: any) => {
  const chainlink = ChainlinkHttpClient;
  const httpCallback = HttpCallback;

  return httpCallback
    .processCallback(req.body)
    .then((result) => {
      console.log(result);

      chainlink.patchUpdateRun(result.id, result.txstatus )
        .then(() => Event.collectEvent.emit("stop", result.id))
        .catch((e) => console.error(e))
        .finally(() => res.type(result.type).status(result.statusCode).send(result.body));
    })
    .catch(({ statusCode, type, body}) => {
      res.type(type).status(statusCode).send(body);
    });
};
