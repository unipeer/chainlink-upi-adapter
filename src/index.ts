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

import { HTTPClient } from "./httpClients";

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

  const client = new HTTPClient();
  switch (method.toLowerCase()) {
    case "collectrequest":
      return collectRequestHandle(client, input.id, <CollectRequest>data).then(
        (response: HandlerResponse<CollectResponse>) => {
          response.data.result = response.data.txId || "";
          return response;
        }
      );
    case "getstatus":
      return getTxStatusHandle(client, <GetStatusRequest>data).then(
        (response: HandlerResponse<TxStatusResponse>) => {
          response.data.result = response.data.txSuccess || false;
          return response;
        }
      );
    case "validatevpa":
      return validateVPAHandle(client, <ValidateVPARequest>data).then(
        (response: any) => {
          response.data.result = response.data.success || false;
          return response;
        }
      );
    default:
      throw { statusCode: 400, data: "Invalid method" };
  }
};

export const requestWrapper = async (req: JobRequest): Promise<JobResponse> => {
  let response = <JobResponse>{ jobRunID: req.id || "" };
  return createRequest(req)
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
  let response = await requestWrapper(<JobRequest>req.body);
  res.status(response.statusCode).send(response);
};

// createRequest() wrapper for AWS Lambda
export const handler = async (
  event: JobRequest,
  context: any = {},
  callback: { (error: any, result: any): void }
): Promise<any> => {
  callback(null, await requestWrapper(event));
};
