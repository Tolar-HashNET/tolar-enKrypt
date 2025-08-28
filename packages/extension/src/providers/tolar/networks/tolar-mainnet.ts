import { NetworkNames } from "@enkryptcom/types";
import { TolarNetwork, TolarNetworkOptions } from "../types/tolar-network";
import { NetworkId } from "@tolar/web3-plugin-tolar";
import {tolarScanActivity} from '../libs/activity-handlers';
import {TolarRpcEndpoints} from "@/providers/tolar/types";

const tolarMainnetOptions: TolarNetworkOptions = {
  networkId: NetworkId.Mainnet,
  name: NetworkNames.Tolar,
  name_long: "Mainnet",
  blockExplorerTX: "https://blockscout.tolar.io/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.tolar.io/address/[[address]]",
  isTestNetwork: false,
  node: TolarRpcEndpoints.get(NetworkId.Mainnet)!,
  activityHandler: tolarScanActivity,
};

const tolarMainnetNetwork = new TolarNetwork(tolarMainnetOptions);

export default tolarMainnetNetwork;
