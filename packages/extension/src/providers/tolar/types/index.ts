import type { Provider as InjectedProvider } from "../inject";
import { NetworkNames } from "@enkryptcom/types";
import { NetworkId } from "@tolar/web3-plugin-tolar";

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

export const TolarRpcEndpoints = new Map<NetworkId, string>([
  [NetworkId.Local, "http://127.0.0.1:8200/jsonrpc"],
  [NetworkId.Stagenet, "https://jsongw.stagenet.tolar.io/jsonrpc"],
  [NetworkId.Testnet, "https://jsongw.testnet.tolar.io/jsonrpc"],
  [NetworkId.Mainnet, "https://jsongw.mainnet.tolar.io/jsonrpc"]
]);
