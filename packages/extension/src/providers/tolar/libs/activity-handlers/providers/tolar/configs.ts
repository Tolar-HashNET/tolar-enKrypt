import { NetworkNames } from '@enkryptcom/types';
import {TolarRpcEndpoints} from "@/providers/tolar/types";
import {NetworkId} from "@tolar/web3-plugin-tolar";

const NetworkEndpoints = {
  [NetworkNames.Tolar]: TolarRpcEndpoints.get(NetworkId.Mainnet)!,
  [NetworkNames.TolarStaging]: TolarRpcEndpoints.get(NetworkId.Stagenet)!,
  [NetworkNames.TolarTestnet]: TolarRpcEndpoints.get(NetworkId.Testnet)!,
  [NetworkNames.TolarLocal]: TolarRpcEndpoints.get(NetworkId.Local)!,
};

const tolarTtls = 30000;

const NetworkTtls = {
  [NetworkNames.Tolar]: tolarTtls,
  [NetworkNames.TolarStaging]: tolarTtls,
  [NetworkNames.TolarTestnet]: tolarTtls,
  [NetworkNames.TolarLocal]: tolarTtls,
};

export { NetworkEndpoints, NetworkTtls };
