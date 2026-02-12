import { getCustomError } from '@/libs/error';
import { MiddlewareFunction } from '@enkryptcom/types';
import TolarProvider from "@/providers/tolar";
import { WindowPromise } from '@/libs/window-promise';
import AccountState from '../libs/accounts-state';
import { ProviderRPCRequest } from '@/types/provider';
import type { RpcTxRequest } from '@tolar/web3-plugin-tolar'
import { getNetworkById } from '@/libs/utils/networks.ts';
import TolarAPI from '@/providers/tolar/libs/api.ts';

const method: MiddlewareFunction = async function (
  this: TolarProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'tol_sendRawTransaction') {
    return next();
  }

  if (!payload.options || !payload.options.domain) {
    res(getCustomError('tol_sendRawTransaction: Domain is missing'));
    return;
  }

  if (!payload.params || payload.params.length < 1) {
    return res(
      getCustomError('tol_sendRawTransaction: Missing transaction parameter'),
    );
  }

  const accountsState = new AccountState();

  const addresses = await accountsState.getApprovedAddresses(payload.options!.domain);
  if (!addresses.length) {
    return res(null, '');
  }

  const senderAddress = addresses[0];
  const tx = payload.params[0] as RpcTxRequest;
  if (tx.senderAddress === undefined || tx.senderAddress === null) {
    tx.senderAddress = senderAddress;
  }

  if(tx.senderAddress !== senderAddress) {
    return res(
      getCustomError(`tol_sendRawTransaction: Sender address from transaction request: ${tx.senderAddress} differs from approved address: ${senderAddress}`),
    );
  }

  if(tx.networkId === undefined || tx.networkId === null) {
    tx.networkId = this.network.networkId;
  }

  if(tx.amount === undefined || tx.amount === null || tx.amount === '') {
    return res(
      getCustomError(`tol_sendRawTransaction: amount is missing`),
    );
  }

  if(tx.gas === undefined || tx.gas === null || tx.gas === '') {
    tx.gas = "21000";
  }

  if(tx.gasPrice === undefined || tx.gasPrice === null || tx.gasPrice === '') {
    tx.gasPrice = "1";
  }

  if(tx.data === undefined || tx.data === null) {
    tx.data = "";
  }

  if(tx.nonce === undefined || tx.nonce === null || tx.nonce === '') {
    const network = await getNetworkById(tx.networkId);
    if(network === undefined) {
      return res(
        getCustomError(`tol_sendRawTransaction: Failed to get requested network with id: ${tx.networkId}`),
      );
    }

    const api = (await network.api()) as TolarAPI;
    tx.nonce = await api.getNonce(tx.senderAddress);
  }

  const account = await this.KeyRing.getAccount(senderAddress);

  const windowPromise = new WindowPromise();

  const {error, result} = await windowPromise.getResponse(
    this.getUIPath(this.UIRoutes.tolSendRawTransaction.path),
    JSON.stringify({
      ...payload,
      params: [tx, account, this.network.name],
    }),
    true,
  );

  if (error) {
    return res(error);
  }

  res(null, JSON.parse(result as string));
};

export default method;
