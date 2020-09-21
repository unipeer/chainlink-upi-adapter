import fetch from "node-fetch";

import config from "../config";
import { HTTPCallbackClass, ChainlinkHTTPClient } from "../httpClients";

export const callbackHandle = async (req: any, res: any) => {
  const chainlink = new ChainlinkHTTPClient();
  const httpCallback = new HTTPCallbackClass();

  return httpCallback
    .processCallback(req.body)
    .then((result) => {
      console.log(result);

      chainlink.patchUpdateRun(result.id, result.txstatus )
        .catch((e) => console.log(e))
        .finally(() => res.type(result.type).status(result.statusCode).send(result.body));
    })
    .catch(({ statusCode, type, body}) => {
      res.type(type).status(statusCode).send(body);
    });
};
