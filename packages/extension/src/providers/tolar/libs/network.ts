import AllTolarNetworks from "../networks";
import { TolarNetwork } from "@/providers/tolar/types/tolar-network";

export const getNetworkInfo = (networkName: string) => {
  console.error(`Tolar::getNetworkInfo called networkName: ${networkName}`);
  const networkObject = Object.values(AllTolarNetworks).find(
    (n) => n.name === networkName
  );

  return {
    name: networkName,
    node: networkObject?.node || "",
    networkId: networkObject?.networkId || "",
  };
};

export const findTolarNetwork = (
  network: string | number
): TolarNetwork | undefined => {
  console.error(`Tolar::findTolarNetwork called network: ${network}`);
  const allNetworks = Object.values(AllTolarNetworks);

  let searchPredicate;
  if (typeof network === "number") {
    searchPredicate = (net: TolarNetwork) => net.networkId == network;
  } else {
    searchPredicate = (net: TolarNetwork) => net.name === network;
  }

  return allNetworks.find(searchPredicate);
};
