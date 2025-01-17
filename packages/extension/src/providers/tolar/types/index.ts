import type { Provider as InjectedProvider } from "../inject";
import { NetworkNames } from "@enkryptcom/types";

export { InjectedProvider };

export const TolarNetworks = {
  mainnet: NetworkNames.Tolar,
  testnet: NetworkNames.TolarTestnet,
  staging: NetworkNames.TolarStaging,
  local: NetworkNames.TolarLocal,
};
