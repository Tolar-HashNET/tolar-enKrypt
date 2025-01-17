import { Activity } from "@/types/activity";
import { BaseNetwork, BaseNetworkOptions } from "@/types/base-network";
import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import { AssetsType, ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import TolarAPI from "../libs/api";
import createIcon from "@/providers/ethereum/libs/blockies";
import {
  formatFloatingPointValue,
  formatFiatValue,
} from "@/libs/utils/number-formatter";
import { fromBase } from "@enkryptcom/utils";
import { logError } from "../libs/utils";
import { TolarToken } from "../types/tolar-token";

export interface TolarNetworkOptions {
  networkId: number;
  name: NetworkNames;
  name_long: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  isTestNetwork: boolean;
  icon: string;
  node: string;
}

export class TolarNetwork extends BaseNetwork {
  public readonly networkId: number;

  constructor(options: TolarNetworkOptions) {
    const api = async () => {
      return new TolarAPI(options.node);
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
      displayAddress: (address: string): string => {
        return address;
      },
      api,
      ...options,
    };

    super(baseOptions);
    this.networkId = options.networkId;
  }

  public async getAllTokens(address: string): Promise<BaseToken[]> {
    const assets = await this.getAllTokenInfo(address);
    return assets.map((token) => {
      const tokenOptions: BaseTokenOptions = {
        decimals: token.decimals,
        icon: token.icon,
        name: token.name,
        symbol: token.symbol,
        balance: token.balance,
        price: token.value,
      };

      return new TolarToken(tokenOptions);
    });
  }

  public async getAllTokenInfo(address: string): Promise<AssetsType[]> {
    try {
      const api = (await this.api()) as TolarAPI;
      const balance = await api.getBalance(address);

      const nativeUsdBalance = 0;
      const currentPrice = 0;

      const asset: AssetsType = {
        balance,
        balancef: formatFloatingPointValue(fromBase(balance, this.decimals))
          .value,
        balanceUSD: nativeUsdBalance,
        balanceUSDf: formatFiatValue(nativeUsdBalance.toString()).value,
        icon: this.icon,
        name: this.name_long,
        symbol: this.currencyName,
        value: currentPrice.toString(),
        valuef: formatFiatValue(currentPrice.toString()).value,
        contract: "",
        decimals: this.decimals,
        sparkline: "",
        priceChangePercentage: 0,
      };

      return [asset];
    } catch (e: unknown) {
      logError(e);
    }

    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getAllActivity(address: string): Promise<Activity[]> {
    return Promise.resolve([]);
  }
}
