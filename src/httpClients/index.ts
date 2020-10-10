export * from "./ChainlinkClient";
export * from "./IHttpClient";
export * from "./ICallbackClient";

import {IHttpClient} from "./IHttpClient";
import {ICallbackClient} from "./ICallbackClient";

import {RBLClient} from "./RBLClient";
import {RBLCallback} from "./RBLCallback";

export const getHttpClient = (name: string): IHttpClient => {
  switch (name) {
    case RBLClient.getName():
      return RBLClient;
    default:
      throw Error("unknow name");
  }
}

export const getCallbackClient = (name: string): ICallbackClient => {
  switch (name) {
    case RBLCallback.getName():
      return RBLCallback;
    default:
      throw Error("unknow name");
  }
}
