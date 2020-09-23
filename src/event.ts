import { EventEmitter } from "events";

import {
  HttpClient,
  HttpClientClass,
  ChainlinkHttpClient,
  ChainlinkHttpClientClass,
} from "./httpClients";
import { GetStatusRequest, TxStatus, TxStatusResponse } from "./types";

import config from "./config";

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
      }, config.PAY_TIMEOUT_MINS * 3600 * 1000 /* X mins */);

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
    console.log("Polling tx status for tx:", txId);

    this.httpClient
      .getTxStatus(<GetStatusRequest>{ txId })
      .then((res: TxStatusResponse) => {
        console.log(res);

        if (this.pendingJobs.has(jobId) && res.txStatus != TxStatus.PENDING) {
          this.chainlinkClient
            .patchUpdateRun(jobId, res.txSuccess)
            .then((res) => res.text())
            .then((res) => {
              console.log(res);
              Event.collectEvent.emit("stop", jobId);
            });
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        if (this.pendingJobs.has(jobId)) {
          setTimeout(() => {
            this.pollTxStatus(tx);
          }, 2 * 1000 /* 2 second */);
        }
      });
  }
}

export const Event = new EventService();
