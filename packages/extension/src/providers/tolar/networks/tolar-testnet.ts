import { NetworkNames } from "@enkryptcom/types";
import { TolarNetwork, TolarNetworkOptions } from "../types/tolar-network";
import { NetworkId } from "@tolar/web3-plugin-tolar";
import icon from './icons/tolar-mainnet.png';
import {tolarScanActivity} from '../libs/activity-handlers';
import {TolarRpcEndpoints} from "@/providers/tolar/types";

const tolarTestnetOptions: TolarNetworkOptions = {
  networkId: NetworkId.Testnet,
  name: NetworkNames.TolarTestnet,
  name_long: "Tolar Testnet",
  blockExplorerTX: "https://blockscout.testnet.tolar.io/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.testnet.tolar.io/address/[[address]]",
  isTestNetwork: true,
  icon,
  node: TolarRpcEndpoints.get(NetworkId.Testnet)!,
  activityHandler: tolarScanActivity,
};

const tolarTestnetNetwork = new TolarNetwork(tolarTestnetOptions);

export default tolarTestnetNetwork;
