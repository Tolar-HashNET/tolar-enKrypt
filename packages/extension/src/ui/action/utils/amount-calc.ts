import MarketData from '@/libs/market-data';
import { BaseNetwork } from '@/types/base-network';
import { formatFloatingPointValue, formatFiatValue } from '../utils/filters';
const defaultFiatVal = '0.00';

export function getCryptoAmount(cryptoAmountRaw: string): string {
  return cryptoAmountRaw !== '~'
    ? formatFloatingPointValue(cryptoAmountRaw).value
    : cryptoAmountRaw;
}

export async function getFiatAmount(cryptoAmountRaw: string, network: BaseNetwork): Promise<string> {
  const marketData = new MarketData();
  let fiatAmount = defaultFiatVal;

  if (network.coingeckoID && cryptoAmountRaw != '~') {
    try {
      fiatAmount = `${
        formatFiatValue(
          await marketData.getTokenValue(
            cryptoAmountRaw,
            network.coingeckoID,
            'USD',
          ),
        ).value
      } USD`;
    } catch {}
  }

  return fiatAmount;
}
