import fetch from "node-fetch";
import { StatusCodes } from "http-status-codes";

import { GetStatusRequest, TxStatusResponse } from "../types";
import { IHttpClient } from "../httpClients";

export const getTxStatusHandle = async (
  data: GetStatusRequest,
  httpClient: IHttpClient
) => {
  if (!("txId" in data)) {
    throw {
      statusCode: StatusCodes.BAD_REQUEST,
      data: "missing required parameters",
    };
  }

  return httpClient
    .getTxStatus(data)
    .then((result: TxStatusResponse) => {
      if (!result.success) {
        throw {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          data: result.message,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        data: result,
      };
    })
    .catch((error: Error) => {
      console.log(error);
      throw {
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        data: error.message,
      };
    });
};
