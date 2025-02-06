import { CallbackFunction, MiddlewareFunction } from "@enkryptcom/types";
import type TolarProvider from "..";
import { ProviderRPCRequest } from "@/types/provider";
import { WindowPromise } from "@/libs/window-promise";
import AccountState from "../libs/accounts-state";
import { getCustomError } from "@/libs/error";

let isAccountAccessPending = false;

const pendingPromises: {
  payload: ProviderRPCRequest;
  res: CallbackFunction;
}[] = [];

const method: MiddlewareFunction = async function (
  this: TolarProvider,
  payload: ProviderRPCRequest,
  res,
  next
): Promise<void> {
  // console.error(
  //   `!-- Tolar:tol_requestAccounts payload: ${JSON.stringify(payload)} --!`
  // );

  if (payload.method !== "tol_requestAccounts") {
    return next();
  }

  if (isAccountAccessPending) {
    pendingPromises.push({
      payload,
      res,
    });
    return;
  }

  isAccountAccessPending = true;

  const handleRemainingPromises = () => {
    isAccountAccessPending = false;
    if (pendingPromises.length === 0) {
      return;
    }

    const pendingPromise = pendingPromises.pop();
    if (pendingPromise) {
      handleAccountAccess(pendingPromise.payload, pendingPromise.res);
    }
  };

  const handleAccountAccess = async (
    _payload: ProviderRPCRequest,
    _res: CallbackFunction
  ) => {
    if (
      _payload.options === undefined ||
      _payload.options.domain === undefined
    ) {
      _res(getCustomError("No domain set!"));
      return;
    }

    isAccountAccessPending = true;
    const accountsState = new AccountState();
    const accounts = await accountsState.getApprovedAddresses(
      _payload.options.domain
    );

    if (accounts.length) {
      _res(null, [accounts.map((acc) => this.network.displayAddress(acc))[0]]);
      handleRemainingPromises();
      return;
    }

    const windowPromise = new WindowPromise();
    const dappConnectResponse = await windowPromise.getResponse(
      this.getUIPath(this.UIRoutes.tolConnectDapp.path),
      JSON.stringify({
        ..._payload,
        params: [this.network.name],
      })
    );

    if (dappConnectResponse.error) {
      _res(dappConnectResponse.error as any);
    }

    const dappConnectAccounts = JSON.parse(dappConnectResponse.result || "[]");

    _res(
      null,
      dappConnectAccounts.map((acc: string) => this.network.displayAddress(acc))
    );

    handleRemainingPromises();
  };

  await handleAccountAccess(payload, res);
};

export default method;
