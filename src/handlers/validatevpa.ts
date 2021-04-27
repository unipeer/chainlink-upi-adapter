import { v1 as uuidv1 } from "uuid";
import fetch from "node-fetch";
import { StatusCodes } from "http-status-codes";

import { ValidateVPARequest } from "../types";
import { IHttpClient } from "../httpClients";

export const validateVPAHandle = async (
  data: ValidateVPARequest,
  httpClient: IHttpClient,
) => {
  if (!("vpa" in data)) {
    throw {
      statusCode: StatusCodes.BAD_REQUEST,
      data: "missing required parameters",
    };
  }

  // Some bank API's need a shorter Id
  let id = uuidv1().slice(3);
  const body = {
    refId: id,
    ...data,
  };

  return httpClient
    .validateVPA(body)
    .then((result: any) => {
      return {
        statusCode: StatusCodes.OK,
        data: result,
      };
    })
    .catch((error: Error) => {
      throw {
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        data: error.message,
      };
    });
};
