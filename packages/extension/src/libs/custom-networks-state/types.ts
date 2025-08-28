import {CustomNetworkOptions} from "@/providers/common/types";

export enum StorageKeys {
  customNetworksInfo = 'custom-networks-info',
}

export interface IState {
  customNetworks: CustomNetworkOptions[];
}
