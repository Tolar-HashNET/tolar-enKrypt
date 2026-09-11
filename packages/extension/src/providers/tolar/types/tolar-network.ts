import { Activity } from "@/types/activity";
import { BaseNetwork, BaseNetworkOptions } from "@/types/base-network";
import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import { AssetsType, ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import TolarAPI from "../libs/api";
import createIcon from "@/providers/ethereum/libs/blockies";
import icon from '../networks/icons/tolar-logo.png';
import {
  formatFloatingPointValue,
  formatFiatValue,
} from "@/libs/utils/number-formatter";
import { fromBase } from "@enkryptcom/utils";
import { logError } from "../libs/utils";
import { TolarToken } from "../types/tolar-token";
import { TolarErc20Token } from "../types/tolar-erc20-token";
import { TokensState } from "@/libs/tokens-state";
import { CustomErc20Token, TokenType } from "@/libs/tokens-state/types";

export interface TolarNetworkOptions {
  networkId: number;
  name: NetworkNames;
  name_long: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  isTestNetwork: boolean;
  node: string;
  activityHandler: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;
}

class ApiCache {
  private cache: Map<string, TolarAPI> = new Map();

  public get(node: string): TolarAPI {
    let api = this.cache.get(node);
    if (api) {
      return api;
    }

    api = new TolarAPI(node);
    this.cache.set(node, api);

    return api;
  }
}

const API_CACHE = new ApiCache();

export class TolarNetwork extends BaseNetwork {
  public readonly networkId: number;

  private activityHandler: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;

  constructor(options: TolarNetworkOptions) {
    const api = async () => {
      return API_CACHE.get(options.node);
    };

    const baseOptions: BaseNetworkOptions = {
      currencyName: "TOL",
      currencyNameLong: "Tolar",
      identicon: createIcon,
      decimals: 18,
      signer: [SignerType.secp256k1tol],
      provider: ProviderName.tolar,
      homePage: "https://tolar.io/",
      basePath: "m/44'/60'/0'/0",
      icon: icon,
      customTokens: true,
      displayAddress: (address: string): string => {
        return address;
      },
      api,
      ...options,
    };

    super(baseOptions);
    this.networkId = options.networkId;
    this.activityHandler = options.activityHandler;
  }

  public async getAllTokens(address: string): Promise<BaseToken[]> {
    const assets = await this.getAllTokenInfo(address);
    return assets.map((token) => {
      if (token.contract) {
        return new TolarErc20Token({
          decimals: token.decimals,
          icon: token.icon,
          name: token.name,
          symbol: token.symbol,
          balance: token.balance,
          price: token.value,
          contract: token.contract,
          networkId: this.networkId,
        });
      }
      return new TolarToken({
        decimals: token.decimals,
        icon: token.icon,
        name: token.name,
        symbol: token.symbol,
        balance: token.balance,
        price: token.value,
      });
    });
  }

  public async getAllTokenInfo(address: string): Promise<AssetsType[]> {
    try {
      const api = (await this.api()) as TolarAPI;
      const balance = await api.getBalance(address);

      const nativeAsset: AssetsType = {
        balance,
        balancef: formatFloatingPointValue(fromBase(balance, this.decimals)).value,
        balanceUSD: 0,
        balanceUSDf: formatFiatValue("0").value,
        icon: this.icon,
        name: this.name_long,
        symbol: this.currencyName,
        value: "0",
        valuef: formatFiatValue("0").value,
        contract: "",
        decimals: this.decimals,
        sparkline: "",
        priceChangePercentage: 0,
      };

      const assets: AssetsType[] = [nativeAsset];

      // Load saved ERC20 tokens
      const tokensState = new TokensState();
      const savedTokens = await tokensState.getTokensByNetwork(this.name);

      for (const saved of savedTokens) {
        if (saved.type !== TokenType.ERC20) continue;
        const erc20 = saved as CustomErc20Token;

        const tokenBalance = await api.getErc20Balance(
          erc20.address,
          address,
          this.networkId
        );

        assets.push({
          balance: tokenBalance,
          balancef: formatFloatingPointValue(fromBase(tokenBalance, erc20.decimals)).value,
          balanceUSD: 0,
          balanceUSDf: formatFiatValue("0").value,
          icon: erc20.icon,
          name: erc20.name,
          symbol: erc20.symbol,
          value: "0",
          valuef: formatFiatValue("0").value,
          contract: erc20.address,
          decimals: erc20.decimals,
          sparkline: "",
          priceChangePercentage: 0,
        });
      }

      return assets;
    } catch (e: unknown) {
      logError(e);
    }

    return [];
  }

  public getAllActivity(address: string): Promise<Activity[]> {
    return this.activityHandler(this, address);
  }
}
