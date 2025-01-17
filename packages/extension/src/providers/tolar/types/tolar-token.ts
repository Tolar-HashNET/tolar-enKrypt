import { BaseToken, BaseTokenOptions, SendOptions } from "@/types/base-token";
import TolarAPI from "../libs/api";

export class TolarToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(
    api: TolarAPI,
    address: string
  ): Promise<string> {
    return await api.getBalance(address);
  }

  public send(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    api: TolarAPI,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    to: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    amount: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: SendOptions
  ): Promise<any> {
    throw new Error("Tolar send is not implemented");
  }
}
