import { InternalStorageNamespace } from '@/types/provider';
import BrowserStorage from '../common/browser-storage';
import { IState, StorageKeys } from './types';
import {CustomNetworkOptions} from "@/providers/common/types";

export default class CustomNetworksState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(
      InternalStorageNamespace.customNetworksState,
    );
  }

  async addCustomNetwork(options: CustomNetworkOptions): Promise<string> {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo,
    );
    options.name = `custom-${options.name}`;
    if (state && state.customNetworks) {
      const networkExists = state.customNetworks.find(
        net => net.name === options.name
      );

      if (networkExists) {
        return networkExists.name;
      }
      state.customNetworks.push(options);
      await this.storage.set(StorageKeys.customNetworksInfo, state);
    } else {
      const newState: IState = {
        customNetworks: [options],
      };
      await this.storage.set(StorageKeys.customNetworksInfo, newState);
    }
    return options.name;
  }

  async getCustomNetwork(
    networkId: number,
  ): Promise<CustomNetworkOptions | null> {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo,
    );

    if (state && state.customNetworks) {
      const networkOptions = state.customNetworks.find(
        option => option.networkId === networkId,
      );

      if (networkOptions) {
        return networkOptions;
      }
    }

    return null;
  }

  async getAllCustomNetworks(): Promise<CustomNetworkOptions[]> {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo,
    );

    if (state && state.customNetworks) {
      return state.customNetworks;
    }

    return [];
  }

  async deleteNetwork(networkId: number): Promise<void> {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo,
    );

    if (state && state.customNetworks) {
      state.customNetworks = state.customNetworks.filter(
        net => net.networkId !== networkId,
      );

      await this.storage.set(StorageKeys.customNetworksInfo, state);
    }
  }

  async deleteNetworkByName(networkName: string): Promise<void> {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo,
    );

    if (state && state.customNetworks) {
      state.customNetworks = state.customNetworks.filter(
        net => net.name !== networkName,
      );

      await this.storage.set(StorageKeys.customNetworksInfo, state);
    }
  }
}
