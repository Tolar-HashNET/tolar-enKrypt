import AllTolarNetworks from "../networks";
import { TolarNetwork } from "@/providers/tolar/types/tolar-network";
import { NetworkInfo } from "@tolar/web3-plugin-tolar";

export const getNetworkInfo = (networkName: string) : NetworkInfo => {
  const networkObject = Object.values(AllTolarNetworks).find(
    (n) => n.name === networkName
  );

  return {
    name: networkName,
    node: networkObject?.node || "",
    networkId: networkObject?.networkId ?? 0,
  };
};

export const findTolarNetwork = (
  network: string | number
): TolarNetwork | undefined => {
  const allNetworks = Object.values(AllTolarNetworks);

  let searchPredicate;
  if (typeof network === "number") {
    searchPredicate = (net: TolarNetwork) => net.networkId == network;
  } else {
    searchPredicate = (net: TolarNetwork) => net.name === network;
  }

  return allNetworks.find(searchPredicate);
};
