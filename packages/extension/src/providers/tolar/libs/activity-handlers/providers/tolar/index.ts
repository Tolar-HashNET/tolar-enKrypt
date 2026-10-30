import cacheFetch from '@/libs/cache-fetch';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import {converters} from "@tolar/web3-plugin-tolar";
import type {RpcTxResponse} from "@tolar/web3-plugin-tolar";
import {orderBy, isEmpty} from "lodash"
import { TokensState } from '@/libs/tokens-state';
import { CustomErc20Token, TokenType } from '@/libs/tokens-state/types';

type RawTransactionList = { result: {transactions: object[] }};

const getAddressActivity = async (
  address: string,
  endpoint: string,
  ttl: number
): Promise<RpcTxResponse[]> => {
  try {
    const rawTxResponses : RawTransactionList = await cacheFetch(
      {
        url: endpoint,
        post: {
          id:1,
          jsonrpc: "2.0",
          method: "tol_getTransactionList",
          params: [[address.slice(2)], 100, 0]
        }
      },
      ttl
    );

    if(isEmpty(rawTxResponses.result)) {
      return [];
    }

    const rpcTxs = rawTxResponses.result.transactions.map((rawTxResponse) => converters.toRpcTxResponse(rawTxResponse));
    return orderBy(rpcTxs, "confirmationTimestamp", "desc");
  } catch (e) {
    console.error('Failed to fetch activity:', e);
    return [];
  }
};

const tolarTtls = 30000;

export default async (
  network: BaseNetwork,
  address: string,
): Promise<Activity[]> => {
  const activities = await getAddressActivity(
    address,
    network.node,
    tolarTtls,
  );

  const savedTokens = (
    await new TokensState().getTokensByNetwork(network.name).catch(() => [])
  ).filter((t) => t.type === TokenType.ERC20) as CustomErc20Token[];
  const strip = (s: string) => (s ?? '').replace(/^0x/, '').toLowerCase();

  return activities.map((activity: RpcTxResponse, i: number): Activity => {
    let value = activity.value ? activity.value : "0";
    let to = activity.receiverAddress;
    let token = {
      decimals: network.decimals,
      icon: network.icon,
      name: network.currencyNameLong,
      symbol: network.currencyName,
      price: '0',
    };

    // token transfer - show the real recipient and token amount
    const data = strip(activity.data);
    const saved = savedTokens.find(
      (t) => strip(t.address) === strip(activity.receiverAddress)
    );
    if (saved && data.startsWith('a9059cbb') && data.length >= 136) {
      to = converters.toTolHexAddress('0x' + data.slice(32, 72), false);
      value = BigInt('0x' + data.slice(72, 136)).toString();
      token = {
        decimals: saved.decimals,
        icon: saved.icon,
        name: saved.name,
        symbol: saved.symbol,
        price: '0',
      };
    }

    // transaction list returns the timestamp in seconds, not milliseconds
    const time = activity.confirmationTimestamp.getTime();
    const timestamp = time < 1e12 ? time * 1000 : time;

    return {
      nonce: i.toString(),
      network: network.name,
      from: activity.senderAddress,
      to,
      chainId: activity.networkId.toString(),
      value,
      timestamp,
      isIncoming: activity.senderAddress !== address,
      transactionHash: activity.transactionHash,
      token,
      status: activity.excepted ? ActivityStatus.failed: ActivityStatus.success,
      type: ActivityType.transaction,
      rawInfo: activity
    };
  });
};
