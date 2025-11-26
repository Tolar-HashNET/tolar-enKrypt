import { InternalMethods } from "@/types/messenger";
import { SignerTransactionOptions } from "../types";
import { getCustomError } from "@/libs/error";
import sendUsingInternalMessengers from "@/libs/messenger/internal-messenger";
import {calculateTxBodyHash, converters, proto, TolPublicKey, TolTxBody} from "@tolar/web3-plugin-tolar";
import {utils} from "web3";
import {retryAsync} from "ts-retry";
import {EnkryptAccount} from "@enkryptcom/types/dist";
import TolarAPI from "@/providers/tolar/libs/api.ts";

const TolarSigner = async (
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

const sendRawTransaction = async (tolTxBody: TolTxBody, account: EnkryptAccount, api: TolarAPI): Promise<string>  => {
  const signerId = new TolPublicKey(account.publicKey);

  const protoTxBody = tolTxBody.toProto();
  const txBodyHash = calculateTxBodyHash(protoTxBody);

  const signature = await TolarSigner({
    payload: txBodyHash.hexStr,
    account: account,
  });

  const protoSignatureData = proto.SignatureData.create({
    hash: converters.encodeToProto(txBodyHash.hexStr),
    signature: converters.encodeToProto(signature),
    signerId: signerId.encodeProto(),
  });

  const protoSignedTx = proto.SignedTransaction.create({
    body: protoTxBody,
    sigData: protoSignatureData,
  });

  const rawSignedTx = utils.bytesToHex(
    proto.SignedTransaction.toBinary(protoSignedTx)
  );

  const txHash = await api.sendSignedTransaction(rawSignedTx);

  await retryAsync(async () => api.getTransactionStatus(txHash), {
    delay: 1000,
    maxTry: 30,
    until: (lastResult) => lastResult !== null,
  });

  return txHash;
}

export { TolarSigner, sendRawTransaction };
