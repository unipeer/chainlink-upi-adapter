export * from "./httpCallback";
export * from "./ChainlinkClient";
export * from "./IHttpClient";

import {RBLClient} from "./RBLClient";
import {IHttpClient} from "./IHttpClient";

export const getClient = (name: string): IHttpClient => {
  switch (name) {
    case RBLClient.getName():
      return RBLClient;
    default:
      throw Error("unknow name");
  }
}
