import { NetworkNames } from "@enkryptcom/types";
import { TolarNetwork, TolarNetworkOptions } from "../types/tolar-network";
import { NetworkId } from "@tolar/web3-plugin-tolar";
import icon from './icons/tolar-mainnet.png';

const tolarStagingOptions: TolarNetworkOptions = {
  networkId: NetworkId.Stagenet,
  name: NetworkNames.TolarStaging,
  name_long: "Tolar Staging",
  blockExplorerTX: "https://blockscout.staging.tolar.io/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.staging.tolar.io/address/[[address]]",
  isTestNetwork: false,
  icon,
  node: "https://jsongw.staging.tolar.io/jsonrpc",
};

const tolarStagingNetwork = new TolarNetwork(tolarStagingOptions);

export default tolarStagingNetwork;
