export class Request {
  method?: string;
}

export class CollectRequest extends Request {
  amount: string;
  sender: string;
  receiver: string;
  recipient_type?: string;
  deviceId: string;
  note?: string;
}

export class CollectBody extends CollectRequest {
  txId: string;
}

export class GetStatusRequest extends Request {
  sender: string;
  deviceId: string;
  txId: string;
}
