import fetch, { Headers, RequestInit, Response } from "node-fetch";
import { URL } from "url";

import config from "../config";

export class ChainlinkHttpClientClass {
  private readonly init: RequestInit;
  private readonly url = config.NODE_URL;

  /**
   * Creates a new HTTPClient.
   *
   * @param init initializer for requests, defaults to empty.
   */
  constructor(init?: RequestInit) {
    this.init = init || {};
    if (!this.init.headers) {
      this.init.headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.NODE_AUTH}`,
      };
    }
  }

  public async patchUpdateRun(id: string, result: boolean): Promise<any> {
    let path = `/v2/runs/${id}`;

    path = new URL(path, this.url).toString();
    let init = this.initMerge({
      method: "PATCH",
      body: JSON.stringify({
        id,
        data: { result }, // Payment made successfully or not
        pending: false,
      }),
    });
    console.log(init);

    return fetch(path, init);
  }

  /**
   * Creates a new RequestInit for requests.
   *
   * @param init the initializer to merge into the client initializer.
   */
  private initMerge(init?: RequestInit): RequestInit {
    init = Object.assign({ headers: {} }, init || {});

    for (var kv of Object.entries(this.init.headers)) {
      (init.headers as { [key: string]: string })[kv[0]] = kv[1];
    }

    return Object.assign(init, this.init);
  }
}

export const ChainlinkHttpClient = new ChainlinkHttpClientClass();
