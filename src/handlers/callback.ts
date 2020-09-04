import fetch from "node-fetch";
import crypto from "crypto";
import { Request, Response } from "express";
import xmlParser from "xml2json";

import { HttpClient } from "../httpClient";

const algorithm = "aes-256-cbc";
const key = "a11495d6168621eb8bd17b52b368bc2a";
const iv = Buffer.alloc(16);

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

export const callbackHandle = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    let body = xmlParser.toJson(req.body, { object: true });
    console.log(body);

    let text = decrypt(body.data);
    console.log(text);

    let resXml =
      "<UPI_PUSH_Response >" +
      "<statuscode>0<statuscode/>" +
      "<description>ACK Success<description/>" +
      "<UPI_PUSH_Response/>";

    res.type("applicate/xml").status(200).send(resXml);
  } catch (e) {
    let resXml =
      "<UPI_PUSH_Response >" +
      "<statuscode>1<statuscode/>" +
      "<description>Bad Request<description/>" +
      "<UPI_PUSH_Response/>";
    res.type("applicate/xml").status(400).send(resXml);
  }
};
