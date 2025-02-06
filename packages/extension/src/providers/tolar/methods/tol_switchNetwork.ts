import { getCustomError } from "@/libs/error";
import { sendToBackgroundFromBackground } from "@/libs/messenger/extension";
import { InternalMethods } from "@/types/messenger";
import { ProviderRPCRequest } from "@/types/provider";
import { MiddlewareFunction } from "@enkryptcom/types";
import DomainState from "@/libs/domain-state";

import TolarProvider from "..";
import { findTolarNetwork, getNetworkInfo } from "../libs/network";

const method: MiddlewareFunction = async function (
  this: TolarProvider,
  payload: ProviderRPCRequest,
  res,
  next
): Promise<void> {
  if (payload.method !== "tol_switchNetwork") {
    return next();
  }

  if (!payload.params || payload.params.length < 1) {
    return res(getCustomError("tol_switchNetwork: invalid params"));
  }

  const validNetwork = findTolarNetwork(payload.params![0]);
  if (validNetwork) {
    await sendToBackgroundFromBackground({
      message: JSON.stringify({
        method: InternalMethods.changeNetwork,
        params: [validNetwork.name],
      }),
      provider: validNetwork.provider,
      tabId: payload.options?.tabId,
    });

    const domainState = new DomainState();
    await domainState.setSelectedNetwork(validNetwork.name);
    return res(null, getNetworkInfo(validNetwork.name));
  }

  return res(
    getCustomError(
      `tol_switchNetwork: provided network ${payload.params![0]} not supported`
    )
  );
};

export default method;
