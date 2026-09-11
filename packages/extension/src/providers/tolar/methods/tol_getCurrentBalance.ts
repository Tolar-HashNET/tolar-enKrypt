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

  if (!payload.options || !payload.options.domain) {
    return res(getCustomError('tol_getCurrentBalance: Domain is missing'));
  }

  const accountsState = new AccountState();
  const addresses = await accountsState.getApprovedAddresses(payload.options.domain);
 if(!addresses.length) {
  return res(getCustomError('Please connect your wallet first'));
}

  const api = await this.network.api() as TolarAPI;
  const balance = await api.getBalance(addresses[0]);
if (balance === null) {
  return res(getCustomError('Failed to fetch balance. Please check your connection.'));
}
res(null, balance);
};
export default method;
