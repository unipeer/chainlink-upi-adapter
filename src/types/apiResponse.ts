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
    txId: string;     // Success /Failure/ In Progress
    txStatus: string;
    message: string;  // Details about the success/error
    sender: string;
    receiver: string;
    custRRN: string;
}

