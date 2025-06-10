import cacheFetch from '@/libs/cache-fetch';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import { NetworkEndpoints, NetworkTtls } from './configs';
import {converters} from "@tolar/web3-plugin-tolar";
import type {RpcTxResponse} from "@tolar/web3-plugin-tolar";
import {orderBy} from "lodash"

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

    const rpcTxs = rawTxResponses.result.transactions.map((rawTxResponse) => converters.toRpcTxResponse(rawTxResponse));
    return orderBy(rpcTxs, "confirmationTimestamp", "desc");
  } catch (e) {
    console.error('Failed to fetch activity:', e);
    return [];
  }
};

export default async (
  network: BaseNetwork,
  address: string,
): Promise<Activity[]> => {
  const networkName = network.name as keyof typeof NetworkEndpoints;
  const activities = await getAddressActivity(
    address,
    NetworkEndpoints[networkName],
    NetworkTtls[networkName],
  );

  return activities.map((activity: RpcTxResponse, i: number): Activity => {
    const value = activity.value ? activity.value : "0";

    return {
      nonce: i.toString(),
      network: network.name,
      from: activity.senderAddress,
      to: activity.receiverAddress,
      chainId: activity.networkId.toString(),
      value,
      timestamp: activity.confirmationTimestamp.getTime(),
      isIncoming: activity.senderAddress !== address,
      transactionHash: activity.transactionHash,
      token: {
        decimals: network.decimals,
        icon: network.icon,
        name: network.currencyNameLong,
        symbol: network.currencyName,
        price: '0',
      },
      status: activity.excepted ? ActivityStatus.failed: ActivityStatus.success,
      type: ActivityType.transaction,
      rawInfo: activity
    };
  });
};
