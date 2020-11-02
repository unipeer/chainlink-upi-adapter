import fetch from "node-fetch";
import { StatusCodes } from 'http-status-codes';

import config from "../config";
import {
  ICallbackClient,
  ChainlinkClient,
  getCallbackClient,
} from "../httpClients";
import { Event, TxEvent } from "../event";

export const callbackHandle = async (req: any, res: any) => {
  const chainlink = ChainlinkClient;
  const bank = req.params.bank;

  try {
    return getCallbackClient(bank)
      .processCallback(req.body)
      .then((result) => {
        chainlink
          .patchUpdateRun(result.id, result.txstatus)
          .then(() => Event.collectEvent.emit("stop", result.id))
          .catch((e) => console.error(e))
          .finally(() =>
            res.type(result.type).status(result.statusCode).send(result.body)
          );
      })
      .catch(({ statusCode, type, body }) => {
        res.type(type).status(statusCode).send(body);
      });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
