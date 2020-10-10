export class Request {
  method?: string;
  bank?: string;
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

export class ValidateVPARequest extends Request {
  refId: string;    // Our internal unique Id
  vpa: string;
}
