import { NetworkNames } from "@enkryptcom/types";
import { TolarNetwork, TolarNetworkOptions } from "../types/tolar-network";
import { NetworkId } from "@tolar/web3-plugin-tolar";
import icon from './icons/tolar-mainnet.png';
import {tolarScanActivity} from '../libs/activity-handlers';
import {TolarRpcEndpoints} from "@/providers/tolar/types";

const tolarLocalOptions: TolarNetworkOptions = {
  networkId: NetworkId.Local,
  name: NetworkNames.TolarLocal,
  name_long: "Tolar Local",
  blockExplorerTX: "https://127.0.0.1:8081/tx/[[txHash]]",
  blockExplorerAddr: "https://127.0.0.1:8081/address/[[address]]",
  isTestNetwork: true,
  icon,
  node: TolarRpcEndpoints.get(NetworkId.Local)!,
  activityHandler: tolarScanActivity,
};

const tolarLocalNetwork = new TolarNetwork(tolarLocalOptions);

export default tolarLocalNetwork;
