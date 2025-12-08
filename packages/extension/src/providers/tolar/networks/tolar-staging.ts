import { NetworkNames } from "@enkryptcom/types";
import { TolarNetwork, TolarNetworkOptions } from "../types/tolar-network";
import { NetworkId } from "@tolar/web3-plugin-tolar";
import {tolarScanActivity} from '../libs/activity-handlers';
import {TolarRpcEndpoints} from "@/providers/tolar/types";

const tolarStagingOptions: TolarNetworkOptions = {
  networkId: NetworkId.Stagenet,
  name: NetworkNames.TolarStaging,
  name_long: "Staging",
  blockExplorerTX: "https://blockscout.stagenet.tolar.io/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.stagenet.tolar.io/address/[[address]]",
  isTestNetwork: true,
  node: TolarRpcEndpoints.get(NetworkId.Stagenet)!,
  activityHandler: tolarScanActivity,
};

const tolarStagingNetwork = new TolarNetwork(tolarStagingOptions);

export default tolarStagingNetwork;
