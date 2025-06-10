import { ProviderAPIInterface } from "@/types/provider";

import { Web3 } from "web3";
import { logError } from "./utils";
import {
  INVALID_NONCE,
  RpcTxResponse,
  TolarPlugin, TolNum,
} from "@tolar/web3-plugin-tolar";

class API implements ProviderAPIInterface {
  node: string;
  private readonly web3: Web3;

  constructor(node: string) {
    this.node = node;

    this.web3 = new Web3(this.node);
    this.web3.registerPlugin(new TolarPlugin());
  }

  public get api() {
    return this;
  }

  async init(): Promise<void> {}

  async getTransactionStatus(hash: string): Promise<RpcTxResponse | null> {
    try {
      return await this.web3.tolar.getTransaction(hash);
    } catch (e: unknown) {
      logError(e);
    }

    return null;
  }

  async getBalance(address: string): Promise<TolNum> {
    try {
      const res = await this.web3.tolar.getLatestBalance(address);
      return res.balance;
    } catch (e: unknown) {
      logError(e);
    }

    return "0";
  }

  async getNonce(address: string): Promise<TolNum> {
    const nonce = await this.web3.tolar.getNonce(address);
    return nonce === INVALID_NONCE ? "0" : nonce;
  }

  public async sendSignedTransaction(
    signedTransaction: string
  ): Promise<string> {
    return await this.web3.tolar.sendSignedTransaction(signedTransaction);
  }
}

export default API;
