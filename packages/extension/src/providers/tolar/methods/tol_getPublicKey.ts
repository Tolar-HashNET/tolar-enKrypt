import { MiddlewareFunction } from '@enkryptcom/types';
import { ProviderRPCRequest } from '@/types/provider';
import AccountState from '../libs/accounts-state';
import { getCustomError } from '@/libs/error';
import TolarProvider from '..';

const method: MiddlewareFunction = async function (
  this: TolarProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'tol_getPublicKey') {
    return next();
  }

  if (!payload.options || !payload.options.domain) {
    res(getCustomError('tol_getPublicKey: Domain is missing'));
    return;
  }

  const accountsState = new AccountState();
  const addresses = await accountsState.getApprovedAddresses(payload.options!.domain);
  if (!addresses.length) {
    res(null, '');
    return;
  }

  const account = await this.KeyRing.getAccount(addresses[0]);
  res(null, account.publicKey);
};

export default method;
