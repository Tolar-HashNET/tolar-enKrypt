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

    const domainState = new DomainState();
    let selectedNetwork = await domainState.getSelectedNetWork();


    if (!selectedNetwork) {
      selectedNetwork = "Tol";
    }


    const networkInfo = getNetworkInfo(selectedNetwork);

    return res(null, networkInfo);
  } catch (err: any) {
    return res(getCustomError(`tol_getNetwork: ${err.message}`));
  }
};

export default method;
