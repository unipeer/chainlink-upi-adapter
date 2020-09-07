import fetch from "node-fetch";
import xmlParser from "xml2json";
import crypto from "crypto";

import config from "../config";

export class HTTPCallbackClass {
  private readonly algorithm = "aes-256-cbc";
  private readonly iv = Buffer.alloc(16);
  private readonly key = config.BANK.rbl.callback_key;

  private readonly successRes =
    '<UPI_PUSH_Response xmlns="http://rssoftware.com/callbackadapter/domain/">' +
    "<statuscode>0</statuscode>" +
    "<description>ACK Success</description>" +
    "</UPI_PUSH_Response>";
  public readonly failRes =
    '<UPI_PUSH_Response xmlns="http://rssoftware.com/callbackadapter/domain/">' +
    "<statuscode>1</statuscode>" +
    "<description>Bad Request</description>" +
    "</UPI_PUSH_Response>";

  private encrypt(text) {
    let cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }

  private decrypt(text) {
    let decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(text, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted.toString();
  }

  public async processCallback(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let text = this.decrypt(req.data);
        let data = xmlParser.toJson(text, { object: true });
        let result: any = Object.entries(data)[0][1];
        console.log(result);

        let txstatus;
        switch (result.transaction_status.toLowerCase()) {
          case "success":
            txstatus = true;
            break;
          case "failure":
            txstatus = false;
            break;
          case "expired":
            txstatus = false;
            break;
        }

        resolve({
          id: result.RefID,
          txstatus: txstatus,
          type: "application/xml",
          statusCode: 200,
          body: this.successRes,
        });
      } catch (e) {
        reject({
          type: "application/xml",
          statusCode: 400,
          body: this.failRes,
        });
      }
    });
  }
}

