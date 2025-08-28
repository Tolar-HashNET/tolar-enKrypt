import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from './evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import icon from '../networks/icons/eth.svg';
import {CustomNetworkOptions} from "@/providers/common/types";

export class CustomEvmNetwork extends EvmNetwork {
  public isCustomNetwork = true;

  constructor(options: CustomNetworkOptions) {
    const networkName = options.name as NetworkNames;

    const evmNetworkOptions: EvmNetworkOptions = {
      ...options,
      icon,
      activityHandler: wrapActivityHandler(() => Promise.resolve([])),
      blockExplorerAddr:
        options.blockExplorerAddr ?? 'https://www.enkrypt.com/',
      blockExplorerTX: options.blockExplorerTX ?? 'https://www.enkrypt.com/',
      homePage: 'https://www.enkrypt.com/',
      isTestNetwork: false,
      name: networkName,
    };
    super(evmNetworkOptions);
  }
}
