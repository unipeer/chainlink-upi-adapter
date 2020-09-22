import { EventEmitter } from "events";

import {
  HttpClient,
  HttpClientClass,
  ChainlinkHttpClient,
  ChainlinkHttpClientClass,
} from "./httpClients";
import { GetStatusRequest, TxStatus, TxStatusResponse } from "./types";

export type TxEvent = {
  txId: string;
  jobId: string;
};

export class EventService {
  collectEvent = new EventEmitter();
  httpClient: HttpClientClass;
  chainlinkClient: ChainlinkHttpClientClass;
  pendingJobs = new Set();

  constructor({
    httpClient = HttpClient,
    chainlinkClient = ChainlinkHttpClient,
  } = {}) {
    this.httpClient = httpClient;
    this.chainlinkClient = chainlinkClient;
    this.wireup();
  }

  async wireup() {
    this.collectEvent.on("start", async (tx: TxEvent) => {
      const { txId, jobId } = tx;
      this.pendingJobs.add(jobId);

      setTimeout(() => {
        this.pollTxStatus(tx);
      }, 10 * 3600 * 1000 /* 10 mins */);

      // FIXME: only for UAT. Remove in production
      setTimeout(() => {
        this.pollTxStatus(tx);
      }, 2 * 1000 /* 2 seconds */);
    });

    this.collectEvent.on("stop", async (jobId: string) => {
      this.pendingJobs.delete(jobId);
    });
  }

  async pollTxStatus(tx: TxEvent) {
    const { txId, jobId } = tx;
    console.log("Polling tx status for job:", jobId);

    this.httpClient
      .getTxStatus(<GetStatusRequest>{ txId })
      .then((res: TxStatusResponse) => {
        if (this.pendingJobs.has(jobId)) {
          if (res.txStatus != TxStatus.PENDING) {
            this.chainlinkClient
              .patchUpdateRun(jobId, res.txSuccess)
              .then(() => Event.collectEvent.emit("stop", jobId));
          } else {
            setTimeout(() => {
              this.pollTxStatus(tx);
            }, 2 * 1000 /* 2 second */);
          }
        }
      }).catch((e) => console.error(e));
  }
}

export const Event = new EventService();
