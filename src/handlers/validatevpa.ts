import { v1 as uuidv1 } from "uuid";
import fetch from "node-fetch";

import { ValidateVPARequest } from "../types";
import { HttpClient } from "../httpClient";

export const validateVPAHandle = async (data: ValidateVPARequest) => {
  if (!("vpa" in data)) {
    throw { statusCode: 400, data: "missing required parameters" };
  }

  // Some bank API's need a shorter Id
  let id = uuidv1().slice(3);
  const body = {
    refId: id,
    ...data,
  };

  const httpClient = new HttpClient();
  return httpClient
    .validateVPA(body)
    .then((result: any) => {
      return {
        statusCode: 200,
        data: result,
      };
    })
    .catch((error: Error) => {
      throw { statusCode: 503, data: error.message };
    });
};
