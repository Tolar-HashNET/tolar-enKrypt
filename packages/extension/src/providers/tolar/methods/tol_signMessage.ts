import { getCustomError } from '@/libs/error';
import { MiddlewareFunction } from '@enkryptcom/types';
import TolarProvider from "@/providers/tolar";
import { WindowPromise } from '@/libs/window-promise';
import { ProviderRPCRequest } from '@/types/provider';
import AccountState from '../libs/accounts-state';


const method: MiddlewareFunction = async function (
  this: TolarProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'tol_signMessage') {
    return next();
  }

  if (!payload.options || !payload.options.domain) {
    res(getCustomError('tol_signMessage: Domain is missing'));
    return;
  }

  if (!payload.params || payload.params.length < 1) {
    return res(getCustomError('tol_signMessage: Missing message parameter'));
  }

  const accountsState = new AccountState();

  const addresses = await accountsState.getApprovedAddresses(payload.options.domain);
  if (!addresses.length) {
    return res(null, '');
  }

  const senderAddress = addresses[0];

  const account = await this.KeyRing.getAccount(senderAddress);
  const message = payload.params[0] as string;

  const windowPromise = new WindowPromise();
  const {error, result} = await windowPromise.getResponse(
    this.getUIPath(this.UIRoutes.tolSignMessage.path),
    JSON.stringify({
      ...payload,
      params: [message, account, this.network.name],
    }),
    true,
  );

  if (error) {
    return res(error);
  }

  res(null, JSON.parse(result as string));
};

export default method;
