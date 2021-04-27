export class JobDataResponse {
    result?: any;     // the field that should be the result passed to contract
}

export class HandlerResponse<T> {
  statusCode: number;
  data: T & JobDataResponse;
}
