import {
  Request,
  CollectRequest,
  GetStatusRequest,
  ValidateVPARequest,
  CollectResponse,
  TxStatusResponse,
  HandlerResponse,
} from "./types";
import {
  collectRequestHandle,
  getTxStatusHandle,
  validateVPAHandle,
} from "./handlers";

import config from "./config";
import {getHttpClient} from "./httpClients";

export class JobRequest {
  id: string;
  data: Request;
}

class JobResponse {
  jobRunID: string;
  statusCode: number;
  status?: string;
  pending?: boolean;
  data?: any;
  error?: any;
}

export const createRequest = async (input: JobRequest) => {
  const data = input.data;
  const method = process.env.API_METHOD || data.method || "";
  const bank = process.env.API_BANK || data.bank || "rbl";
  const client = getHttpClient(bank);

  switch (method.toLowerCase()) {
    case "collectrequest":
      return collectRequestHandle(input.id, <CollectRequest>data, client).then(
        (response: HandlerResponse<CollectResponse>) => {
          response.data.result = response.data.txId || "";
          return response;
        }
      );
    case "getstatus":
      return getTxStatusHandle(<GetStatusRequest>data, client).then(
        (response: HandlerResponse<TxStatusResponse>) => {
          response.data.result = response.data.txSuccess || false;
          return response;
        }
      );
    case "validatevpa":
      return validateVPAHandle(<ValidateVPARequest>data, client).then(
        (response: any) => {
          response.data.result = response.data.success || false;
          return response;
        }
      );
    default:
      throw { statusCode: 400, data: "Invalid method" };
  }
};

export const requestWrapper = async (req: any): Promise<JobResponse> => {
  let body: JobRequest = req.body;
  if (!auth(req.headers)) {
    return { jobRunID: body.id, statusCode: 401, error: "Unauthorized" };
  }

  let response = <JobResponse>{ jobRunID: body.id || "" };
  return createRequest(body)
    .then(({ statusCode, data }) => {
      response.status = data.status || "success";
      response.pending = data.status === "pending";
      response.data = data;
      response.statusCode = statusCode;
      return response;
    })
    .catch(({ statusCode, data }) => {
      response.status = "errored";
      response.error = data || "Invalid method";
      response.statusCode = statusCode || 400;
      return response;
    });
};

// createRequest() wrapper for GCP
export const gcpservice = async (req: any = {}, res: any): Promise<any> => {
  let response = await requestWrapper(req);
  res.status(response.statusCode).send(response);
};

// createRequest() wrapper for AWS Lambda
export const handler = async (
  event: { body: JobRequest, headers: any },
  context: any = {},
  callback: { (error: any, result: any): void }
): Promise<any> => {
  callback(null, await requestWrapper(event));
};

const auth = (headers: any): boolean => {
  if (!headers) {
    return false;
  }

  let authorization = headers["authorization"];
  if (!authorization) {
    return false;
  }

  let parts = authorization.split(" ");
  if (parts.length < 2) {
    return false;
  }

  let scheme = parts[0],
    credentials = parts[1];
  if (!/Bearer/i.test(scheme)) {
    return false;
  }
  if (credentials.length <= 0) {
    return false;
  }

  if (credentials !== config.NODE_AUTH_OUT) {
    return false;
  }

  return true;
};
