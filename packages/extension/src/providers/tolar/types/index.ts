import type { Provider as InjectedProvider } from "../inject";
import { NetworkNames } from "@enkryptcom/types";

export { InjectedProvider };

export const TolarNetworks = {
  mainnet: NetworkNames.Tolar,
  testnet: NetworkNames.TolarTestnet,
  staging: NetworkNames.TolarStaging,
  local: NetworkNames.TolarLocal,
};

export interface ProviderMessage {
  method: MessageMethod;
  params: Array<any>;
}

export enum MessageMethod {
  changeAddress = 'changeAddress',
  changeNetwork = 'changeNetwork',
  changeConnected = 'changeConnected',
}

export enum EmitEvent {
  accountsChanged = 'accountsChanged',
  networkChanged = 'networkChanged',
  connect = 'connect',
  disconnect = 'disconnect',
}

export const TolarRpcEndpoints = new Map<number, string>([
  [0, "http://127.0.0.1:8200/jsonrpc"],
  [1, "https://jsongw.mainnet.tolar.io/jsonrpc"],
  [2, "https://jsongw.testnet.tolar.io/jsonrpc"],
  [3, "https://jsongw.stagenet.tolar.io/jsonrpc"]
]);
