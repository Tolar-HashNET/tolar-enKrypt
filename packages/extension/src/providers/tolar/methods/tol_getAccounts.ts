import { MiddlewareFunction } from '@enkryptcom/types';
import { ProviderRPCRequest } from '@/types/provider';
import AccountState from '../libs/accounts-state';
import { getCustomError } from '@/libs/error';
import openOnboard from '@/libs/utils/open-onboard';
import { throttle } from 'lodash';
import TolarProvider from "@/providers/tolar";

const throttledOpenOnboard = throttle(() => openOnboard(), 10000);

const method: MiddlewareFunction = async function (
  this: TolarProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'tol_getAccounts') {
    return next();
  }

  if (!payload.options || !payload.options.domain) {
    res(getCustomError('tol_getAccounts: Domain is missing'));
    return;
  }

  const isInitialized = await this.KeyRing.isInitialized();
  if (!isInitialized) {
    res(null, []);
    return throttledOpenOnboard();
  }

  const accountsState = new AccountState();
  const addresses = await accountsState.getApprovedAddresses(payload.options?.domain);

  res(null, addresses);
};

export default method;
