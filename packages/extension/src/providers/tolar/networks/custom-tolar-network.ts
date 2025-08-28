import { NetworkNames } from '@enkryptcom/types';
import { TolarNetwork, TolarNetworkOptions } from "../types/tolar-network";
import {tolarScanActivity} from "../libs/activity-handlers";
import {CustomNetworkOptions} from "@/providers/common/types";


export class CustomTolarNetwork extends TolarNetwork {
  public isCustomNetwork = true;

  constructor(options: CustomNetworkOptions) {
    const networkName = options.name as NetworkNames;

    if(options.networkId === undefined) {
      throw new Error("Network id is missing for custom tolar network");
    }

    const tolarNetworkOptions: TolarNetworkOptions = {
      ...options,
      activityHandler: tolarScanActivity,
      blockExplorerAddr:
        options.blockExplorerAddr ?? '',
      blockExplorerTX: options.blockExplorerTX ?? '',
      isTestNetwork: false,
      name: networkName,
      networkId: options.networkId ?? 0,
    };

    super(tolarNetworkOptions);
  }
}
