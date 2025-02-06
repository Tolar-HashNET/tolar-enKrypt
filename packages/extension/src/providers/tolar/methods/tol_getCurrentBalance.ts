import { MiddlewareFunction } from '@enkryptcom/types';
import TolarProvider from "@/providers/tolar";
import { ProviderRPCRequest } from '@/types/provider';
import { getCustomError } from '@/libs/error';
import AccountState from "../libs/accounts-state";
import TolarAPI from "@/providers/tolar/libs/api";

const method: MiddlewareFunction = async function (
  this: TolarProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'tol_getCurrentBalance') {
    return next();
  }

  // console.error(
  //   `!-- Tolar:tol_getCurrentBalance payload: ${JSON.stringify(payload)} --!`
  // );

  if (!payload.options || !payload.options.domain) {
    return res(getCustomError('tol_getCurrentBalance: Domain is missing'));
  }

  const accountsState = new AccountState();
  const addresses = await accountsState.getApprovedAddresses(payload.options.domain);
  if(!addresses.length) {
    return res(null, '');
  }

  const api = await this.network.api() as TolarAPI;
  const balance = await api.getBalance(addresses[0]);
  res(null, balance);
};
export default method;
