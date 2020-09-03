import fetch from "node-fetch";
import {Request, Response} from "express";

import { HttpClient } from "../httpClient";

export const callbackHandle = async (req: Request, res: Response) => {
  let body = req.body;
  console.log(body);

  let resXml = "<UPI_PUSH_Response >" +
    "<statuscode>0<statuscode/>" +
    "<description>ACK Success<description/>" +
    "<UPI_PUSH_Response/>";

  res.type("applicate/xml").status(200).send(resXml);
};
