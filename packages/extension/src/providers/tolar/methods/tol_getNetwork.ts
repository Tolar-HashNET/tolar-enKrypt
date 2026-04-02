import { getCustomError } from "@/libs/error";
import { ProviderRPCRequest } from "@/types/provider";
import { MiddlewareFunction } from "@enkryptcom/types";
import DomainState from "@/libs/domain-state";

import TolarProvider from "..";
import { getNetworkInfo } from "../libs/network";

const method: MiddlewareFunction = async function (
  this: TolarProvider,
  payload: ProviderRPCRequest,
  res,
  next
): Promise<void> {
  if (payload.method !== "tol_getNetwork") {
    return next();
  }

  try {

   if (!payload.options?.domain) {
  return res(getCustomError("tol_getNetwork: domain is missing"));
}

  const domainState = new DomainState();
  const state = await domainState.getStateByDomain(payload.options.domain);
  const selectedNetwork = state.selectedNetwork || "Tol";


    const networkInfo = getNetworkInfo(selectedNetwork);

    return res(null, networkInfo);
  } catch (err: any) {
    return res(getCustomError(`tol_getNetwork: ${err.message}`));
  }
};

export default method;
