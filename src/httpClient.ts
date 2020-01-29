import fetch, { Headers, RequestInit, Response } from "node-fetch";
import URL from "url";

export class HttpClient {
  private readonly init: RequestInit;

  /**
   * Creates a new HttpClient.
   *
   * @param url required, the base url of all requests.
   * @param init initializer for requests, defaults to empty.
   * @param cache cache storage for requests, defaults to global.
   */
  constructor(init?: RequestInit) {
    this.init = init || {};
    if (!this.init.headers) {
      this.init.headers = {
        apikey: "l7xx57b7cb6715d447a8ac67ee01b1d87914"
      };
    }
  }

  /**
   * Fetch a path directly from the origin.
   *
   * @param path required, the path to fetch, joined by the client url.
   * @param init initializer for the request, recursively merges with client initializer.
   */
  public async collectRequest(body: any): Promise<Response> {
    let path =
      "https://developerapi.icicibank.com:8443/api/v0/upi1/collectrequest";
    let init = this.initMerge({
      method: "POST",
      body: JSON.stringify(body)
    });

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
