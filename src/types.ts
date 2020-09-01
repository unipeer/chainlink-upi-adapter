export class Request {
  method?: string;
}

export class CollectRequest extends Request {
  amount: string;
  sender: string;
  receiver: string;
  note?: string;
}

export class CollectBody extends CollectRequest {
  refId: string;
}

export class GetStatusRequest extends Request {
  txId: string;
}

export class Response {
    success: boolean;  // Whether the API call was successful or not.
    status?: string;
}

export class CollectResponse extends Response {
    refId: string;    // Our internal unique Id
    txId: string;     // UPI system-wide unique tx Id
    message: string;  // Details about the success/error
}

export class TxStatusResponse extends Response {
    txId: string;    // Success /Failure/ In Progress
    message: string; // Details about the success/error
    sender: string;
    receiver: string;
    custRRN: string;
}
