import fetch from "node-fetch";
import crypto from "crypto";
import xmlParser from "xml2json";

import { HttpClient } from "../httpClient";
import config from "../config";

const algorithm = "aes-256-cbc";
const iv = Buffer.alloc(16);
const key = config.AUTH.rbl.callback_key;

function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

function decrypt(text) {
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(text, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted.toString();
}

export const callbackHandle = async (req: any, res: any) => {
  console.log(req.body);
  try {
    let text = decrypt(req.body.data);
    console.log(text);
    let body = xmlParser.toJson(text, { object: true })
    let result: any = Object.entries(res)[0][1];
    console.log(result);

    let resXml =
      "<UPI_PUSH_Response>" +
      "<statuscode>0</statuscode>" +
      "<description>ACK Success</description>" +
      "</UPI_PUSH_Response>";

    res.type("application/xml").status(200).send(resXml);
  } catch (e) {
    let resXml =
      "<UPI_PUSH_Response>" +
      "<statuscode>1</statuscode>" +
      "<description>Bad Request</description>" +
      "</UPI_PUSH_Response>";
    res.type("application/xml").status(400).send(resXml);
  }
};
