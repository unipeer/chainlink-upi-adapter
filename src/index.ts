import {Request, CollectRequest, GetStatusRequest} from "./types";
import {collectRequestHandle, getTxStatusHandle} from "./handlers";

class Response {
    jobRunID: string;
    statusCode: number;
    status?: string;
    pending?: boolean;
    data?: any;
    error?: any;
}

export class JobRequest {
    id: string;
    data: Request;
}

export const createRequest = async (input: JobRequest) => {
    return new Promise((resolve, reject) => {
        const data = input.data;
        const method = process.env.API_METHOD || data.method || "";
        switch (method.toLowerCase()) {
            case "collectRequest":
                collectRequestHandle(<CollectRequest>data)
                    .then((response: any) => {
                        response.data.result = response.data.batch_header.payout_batch_id || "";
                        return resolve(response);
                    }).catch(reject);
                break;
            case "getStatus":
                getTxStatusHandle(<GetStatusRequest>data)
                    .then((response: any) => {
                        response.data.result = response.data.batch_header.payout_batch_id || "";
                        return resolve(response);
                    }).catch(reject);
                break;
            default:
                return reject({statusCode: 400, data: "Invalid method"})
        }
    })
};

export const requestWrapper = async (req: JobRequest): Promise<Response> => {
    return new Promise<Response>(resolve => {
        let response = <Response>{jobRunID: req.id || ""};
        createRequest(req).then(({statusCode, data}) => {
            response.status = data.status || "success";
            response.pending = data.status === "pending";
            response.data = data;
            response.statusCode = statusCode;
            resolve(response)
        }).catch(({statusCode, data}) => {
            response.status = "errored";
            response.error = data;
            response.statusCode = statusCode;
            resolve(response)
        });
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
    callback: { (error: any, result: any): void }): Promise<any> => {
    callback(null, await requestWrapper(event));
};
