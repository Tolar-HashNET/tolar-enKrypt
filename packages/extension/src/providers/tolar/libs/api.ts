import { ProviderAPIInterface } from "@/types/provider";

import { Web3 } from "web3";
import { logError } from "./utils";
import {
  INVALID_NONCE,
  RpcTxResponse,
  TolarPlugin, TolNum,
  ZERO_HEX_ADDRESS,
} from "@tolar/web3-plugin-tolar";
import {
  ERC20_SELECTORS,
  encodeBalanceOf,
  tolToEthAddress,
  decodeString,
  decodeUint,
  Erc20TokenInfo,
} from "./erc20";

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

  // Read-only contract call using tryCallTransaction
  async callContract(
    contractAddress: string,
    data: string,
    networkId: number
  ): Promise<string | null> {
    try {
      const result = await this.web3.tolar.tryCallTransaction({
        senderAddress: ZERO_HEX_ADDRESS,
        receiverAddress: contractAddress,
        amount: "0",
        gas: "100000",
        gasPrice: "1",
        data,
        nonce: "0",
        networkId,
      });
      if (result.excepted) return null;
      return result.output;
    } catch (e: unknown) {
      logError(e);
      return null;
    }
  }

  async getErc20TokenInfo(
    contractAddress: string,
    networkId: number
  ): Promise<Erc20TokenInfo | null> {
    try {
      const [nameOut, symbolOut, decimalsOut] = await Promise.all([
        this.callContract(contractAddress, ERC20_SELECTORS.name, networkId),
        this.callContract(contractAddress, ERC20_SELECTORS.symbol, networkId),
        this.callContract(contractAddress, ERC20_SELECTORS.decimals, networkId),
      ]);

      if (!nameOut || !symbolOut || !decimalsOut) return null;

      const name = decodeString(nameOut);
      const symbol = decodeString(symbolOut);
      const decimals = Number(decodeUint(decimalsOut));

      if (!name || !symbol) return null;

      return { name, symbol, decimals };
    } catch (e: unknown) {
      logError(e);
      return null;
    }
  }

  async getErc20Balance(
    contractAddress: string,
    userAddress: string,
    networkId: number
  ): Promise<string> {
    try {
      const ethAddress = tolToEthAddress(userAddress);
      const data = encodeBalanceOf(ethAddress);
      const output = await this.callContract(contractAddress, data, networkId);
      if (!output) return "0";
      return decodeUint(output).toString();
    } catch (e: unknown) {
      logError(e);
      return "0";
    }
  }
}

export default API;
