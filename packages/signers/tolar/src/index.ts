import {
  privateToPublic,
  ecsign,
  ecrecover,
  fromRpcSig,
  toRpcSig,
} from "@ethereumjs/util";
import { mnemonicToSeed } from "bip39";
import { Errors, SignerInterface, KeyPair } from "@enkryptcom/types";
import { hexToBuffer, bufferToHex } from "@enkryptcom/utils";
import HDkey from "hdkey";
import { converters } from "@tolar/web3-plugin-tolar";


export class TolarSigner implements SignerInterface {
  async generate(mnemonic: string, derivationPath = ""): Promise<KeyPair> {
    const seed = await mnemonicToSeed(mnemonic);
    const hdkey = HDkey.fromMasterSeed(seed);
    const key = hdkey.derive(derivationPath);

    const publicKey = bufferToHex(privateToPublic(key.privateKey));
    return {
      address: converters.toTolHexAddressFromPublicKey(publicKey),
      privateKey: bufferToHex(key.privateKey),
      publicKey
    };
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string
  ): Promise<boolean> {
    const sigdecoded = fromRpcSig(sig as `0x${string}`);

    const rpubkey = ecrecover(
      hexToBuffer(msgHash),
      sigdecoded.v,
      sigdecoded.r,
      sigdecoded.s
    );
    return bufferToHex(rpubkey) === publicKey;
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    const msgHashBuffer = hexToBuffer(msgHash);
    const privateKeyBuffer = hexToBuffer(keyPair.privateKey);
    const signature = ecsign(msgHashBuffer, privateKeyBuffer);
    signature.v -= BigInt(27);
    const rpcSig = toRpcSig(signature.v, signature.r, signature.s);
    if (!this.verify(bufferToHex(msgHashBuffer), rpcSig, keyPair.publicKey)) {
      throw new Error(Errors.SigningErrors.UnableToVerify);
    }

    return rpcSig;
  }
}

