export const enum TxStatus {
  SUCCESSFUL = "successful",
  PENDING = "pending",
  FAILED = "failed"
}

export class Response {
    success: boolean;  // Whether the API call was successful or not.
    status?: string;
}

export class CollectResponse extends Response {
    refId: string;       // Our internal unique Id
    txId: string;        // UPI system-wide unique tx Id
    message: string;     // Details about the success/error
    mockResult?: boolean // Used for mocking result by MockClient
}

export class TxStatusResponse extends Response {
    txId: string;     // Success /Failure/ In Progress
    txStatus: TxStatus;
    txSuccess: boolean;
    message: string;  // Details about the success/error
    custRRN: string;
}

export class ValidateVPAResponse extends Response {
    valid: boolean;
    name?: string;     // Name of user
}
