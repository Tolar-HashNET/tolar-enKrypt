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
