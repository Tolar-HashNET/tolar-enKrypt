import { InternalMethods } from "@/types/messenger";
import { SignerTransactionOptions } from "../types";
import { getCustomError } from "@/libs/error";
import sendUsingInternalMessengers from "@/libs/messenger/internal-messenger";

const TransactionSigner = async (
  options: SignerTransactionOptions
): Promise<string> => {
  const { account, payload } = options;
  if (account.isHardware) {
    throw Error(getCustomError("NOT_IMPLEMENTED").message);
  }

  const signRes = await sendUsingInternalMessengers({
    method: InternalMethods.sign,
    params: [payload, account],
  });

  if (signRes.error) {
    throw Error(getCustomError(signRes.error.message).message);
  }

  return JSON.parse(signRes.result as string);
};

export { TransactionSigner };
