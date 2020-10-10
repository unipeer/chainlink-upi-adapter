
export abstract class ICallbackClient {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getName() {
    return this.name;
  }

  public abstract async processCallback(req: any): Promise<any>;
}
