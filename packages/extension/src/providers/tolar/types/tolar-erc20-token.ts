import { BaseToken, BaseTokenOptions, SendOptions } from "@/types/base-token";
import TolarAPI from "../libs/api";

export interface TolarErc20TokenOptions extends BaseTokenOptions {
  networkId: number;
}

export class TolarErc20Token extends BaseToken {
  public readonly networkId: number;

  constructor(options: TolarErc20TokenOptions) {
    super(options);
    this.networkId = options.networkId;
  }

  public async getLatestUserBalance(
    api: TolarAPI,
    address: string
  ): Promise<string> {
    return api.getErc20Balance(this.contract!, address, this.networkId);
  }

  public send(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _api: TolarAPI,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _to: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _amount: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: SendOptions
  ): Promise<any> {
    throw new Error("ERC20 send not yet implemented for Tolar");
  }
}
