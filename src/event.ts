import { EventEmitter } from "events";

import {
  IHttpClient,
  ChainlinkClient,
  ChainlinkClientClass,
  getHttpClient
} from "./httpClients";
import { GetStatusRequest, TxStatus, TxStatusResponse } from "./types";

import config from "./config";

export type TxEvent = {
  txId: string;
  jobRunId: string;
  bank: string;
  mockResult?: boolean;
};

export class EventService {
  collectEvent = new EventEmitter();
  chainlinkClient: ChainlinkClientClass;
  pendingJobs = new Set();

  constructor({
    chainlinkClient = ChainlinkClient,
  } = {}) {
    this.chainlinkClient = chainlinkClient;
    this.wireup();
  }

  async wireup() {
    this.collectEvent.on("start", async (tx: TxEvent) => {
      const { jobRunId, bank } = tx;
      if (bank == "mock") {
        await this.sleep(2000);
        console.log("marking mock job:", jobRunId, "as", tx.mockResult);
        return this.chainlinkClient
          .patchUpdateRun(jobRunId, tx.mockResult);
      };

      this.pendingJobs.add(jobRunId);

      setTimeout(() => {
        this.pollTxStatus(tx);
      }, config.PAY_TIMEOUT_MINS * 3600 * 1000 /* X mins */);
    });

    this.collectEvent.on("stop", async (jobRunId: string) => {
      console.log("Stopping job run:", jobRunId);
      this.pendingJobs.delete(jobRunId);
    });
  }

  async pollTxStatus(tx: TxEvent) {
    const { txId, jobRunId, bank } = tx;
    console.log("Polling tx status for tx:", txId, "job run:", jobRunId);

    getHttpClient(bank)
      .getTxStatus(<GetStatusRequest>{ txId })
      .then((res: TxStatusResponse) => {

        if (this.pendingJobs.has(jobRunId) && res.txStatus != TxStatus.PENDING) {
          this.chainlinkClient
            .patchUpdateRun(jobRunId, res.txSuccess)
            .then((_) => Event.collectEvent.emit("stop", jobRunId));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        if (this.pendingJobs.has(jobRunId)) {
          setTimeout(() => {
            this.pollTxStatus(tx);
          }, 2 * 1000 /* 2 second */);
        }
      });
  }

  async sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
}

export const Event = new EventService();
