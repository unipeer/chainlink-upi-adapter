import {
  CollectBody,
  GetStatusRequest,
  ValidateVPARequest,
  CollectResponse,
  TxStatus,
  TxStatusResponse,
} from "../types";

export abstract class IHttpClient {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getName() {
    return this.name;
  }

  /**
   * Request to start a payment request from the sender to a receiver
   * with the amount via their UPI Virtual Addresses.
   *
   * The sender must approve the request from their UPI App
   * by confirming the Tx and entering their MPIN.
   *
   * @param body required, the request body as an object.
   */
  public abstract async collectRequest(body: CollectBody): Promise<CollectResponse>;

  /**
   * Request to confirm the status of a payment transaction
   * associated with the `body.txId`.
   *
   * This API should only be called after a collect request
   * has expired and no HTTP callback for the txId was received.
   *
   * @param body required, the request body as an object.
   */
  public abstract async getTxStatus(body: GetStatusRequest): Promise<TxStatusResponse>;

  /**
   * API to confirm an user entered UPI Id or
   * VPA (Virtual Payment Address) is valid or not.
   *
   * This should not be used through a contract but
   * is provided though the same oracle to completeness.
   *
   * Oracle owner can call this API through external auth
   * or by via a web/external initiator as part of chainlink framework.
   *
   * @param body required, the request body as an object.
   */
  public abstract async validateVPA(body: ValidateVPARequest): Promise<any>;
}
