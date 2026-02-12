import { ProviderName } from '@/types/provider';
import { NetworkNames } from '@enkryptcom/types';
import EthereumNetworks from '@/providers/ethereum/networks';
import PolkadotNetworks from '@/providers/polkadot/networks';
import BitcoinNetworks from '@/providers/bitcoin/networks';
import KadenaNetworks from '@/providers/kadena/networks';
import SolanaNetworks from '@/providers/solana/networks';
import TolarNetworks from "@/providers/tolar/networks";
import { BaseNetwork } from '@/types/base-network';
import CustomNetworksState from '../custom-networks-state';
import Ethereum from '@/providers/ethereum/networks/eth';
import Polkadot from '@/providers/polkadot/networks/polkadot';
import Bitcoin from '@/providers/bitcoin/networks/bitcoin';
import Kadena from '@/providers/kadena/networks/kadena';
import Solana from '@/providers/solana/networks/solana';
import Tolar from "@/providers/tolar/networks/tolar-mainnet";
import {CustomTolarNetwork} from "@/providers/tolar/networks/custom-tolar-network.ts";
import { TolarNetwork } from '@/providers/tolar/types/tolar-network.ts';

const providerNetworks: Record<ProviderName, Record<string, BaseNetwork>> = {
  [ProviderName.ethereum]: EthereumNetworks,
  [ProviderName.polkadot]: PolkadotNetworks,
  [ProviderName.bitcoin]: BitcoinNetworks,
  [ProviderName.kadena]: KadenaNetworks,
  [ProviderName.solana]: SolanaNetworks,
  [ProviderName.tolar]: TolarNetworks,
  [ProviderName.enkrypt]: {},
};

const getAllNetworks = async (): Promise<TolarNetwork[]> => {
  const customNetworksState = new CustomNetworksState();

  const customNetworks = (
    await customNetworksState.getAllCustomNetworks()
  ).map(options => new CustomTolarNetwork(options));

  return Object.values(TolarNetworks).concat(customNetworks);
};

const getNetworkByName = async (
  name: string,
): Promise<BaseNetwork | undefined> => {
  return (await getAllNetworks()).find(net => net.name === name);
};

const getProviderNetworkByName = async (
  provider: ProviderName,
  networkName: string,
): Promise<BaseNetwork | undefined> => {
  let networks = Object.values(providerNetworks[provider]);

  if (provider === ProviderName.tolar) {
    const customNetworkState = new CustomNetworksState();
    const customNetworks = (
      await customNetworkState.getAllCustomNetworks()
    ).map(options => new CustomTolarNetwork(options));

    networks = [...customNetworks, ...networks];
  }

  return networks.find(net => net.name === networkName);
};

const getNetworkById = async (networkId: number): Promise<BaseNetwork | undefined> => {
  return (await getAllNetworks()).find(net => net.networkId === networkId);
};

const DEFAULT_EVM_NETWORK_NAME = NetworkNames.Ethereum;
const DEFAULT_SUBSTRATE_NETWORK_NAME = NetworkNames.Polkadot;
const DEFAULT_BTC_NETWORK_NAME = NetworkNames.Bitcoin;
const DEFAULT_KADENA_NETWORK_NAME = NetworkNames.Kadena;
const DEFAULT_SOLANA_NETWORK_NAME = NetworkNames.Solana;
const DEFAULT_TOLAR_NETWORK_NAME = NetworkNames.Tolar;

const DEFAULT_EVM_NETWORK = Ethereum;
const DEFAULT_SUBSTRATE_NETWORK = Polkadot;
const DEFAULT_BTC_NETWORK = Bitcoin;
const DEFAULT_KADENA_NETWORK = Kadena;
const DEFAULT_SOLANA_NETWORK = Solana;
const DEFAULT_TOLAR_NETWORK = Tolar;

const POPULAR_NAMES = [
  NetworkNames.Tolar,
  NetworkNames.Bitcoin,
  NetworkNames.Ethereum,
  NetworkNames.Matic,
  NetworkNames.Polkadot,
  NetworkNames.Binance,
  NetworkNames.Rootstock,
  NetworkNames.Optimism,
  NetworkNames.Kadena,
];
export {
  getAllNetworks,
  getNetworkByName,
  getProviderNetworkByName,
  getNetworkById,
  DEFAULT_EVM_NETWORK_NAME,
  DEFAULT_SUBSTRATE_NETWORK_NAME,
  DEFAULT_BTC_NETWORK_NAME,
  POPULAR_NAMES,
  DEFAULT_EVM_NETWORK,
  DEFAULT_SUBSTRATE_NETWORK,
  DEFAULT_BTC_NETWORK,
  DEFAULT_KADENA_NETWORK,
  DEFAULT_KADENA_NETWORK_NAME,
  DEFAULT_SOLANA_NETWORK,
  DEFAULT_SOLANA_NETWORK_NAME,
  DEFAULT_TOLAR_NETWORK,
  DEFAULT_TOLAR_NETWORK_NAME,
};
