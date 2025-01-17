import { NetworkNames } from "@enkryptcom/types";
import { TolarNetwork, TolarNetworkOptions } from "../types/tolar-network";
import { NetworkId } from "@tolar/web3-plugin-tolar";
import icon from './icons/tolar-mainnet.png';

const tolarTestnetOptions: TolarNetworkOptions = {
  networkId: NetworkId.Testnet,
  name: NetworkNames.TolarTestnet,
  name_long: "Tolar Testnet",
  blockExplorerTX: "https://blockscout.testnet.tolar.io/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.testnet.tolar.io/address/[[address]]",
  isTestNetwork: true,
  icon,
  node: "https://jsongw.testnet.tolar.io/jsonrpc",
};

const tolarTestnetNetwork = new TolarNetwork(tolarTestnetOptions);

export default tolarTestnetNetwork;
