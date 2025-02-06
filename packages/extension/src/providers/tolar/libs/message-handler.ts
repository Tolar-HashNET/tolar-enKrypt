import {handleIncomingMessage as handleIncomingMessageType, TolarProvider,} from "@/types/provider";
import {EmitEvent, MessageMethod, ProviderMessage} from "@/providers/tolar/types";

const handleIncomingMessage: handleIncomingMessageType = async (
  provider,
  message
): Promise<void> => {
  try {
    // console.error(
    //   `!-- Tolar:handleIncomingMessage message: ${JSON.stringify(message)} --!`
    // );
    const _provider = provider as TolarProvider;
    const jsonMsg = JSON.parse(message) as ProviderMessage;

    if (jsonMsg.method === MessageMethod.changeConnected) {
      // console.error(
      //   `handleIncomingMessage::changeConnected jsonMsg: ${JSON.stringify(
      //     jsonMsg
      //   )}`
      // );
      const isConnected = jsonMsg.params[0] as boolean;
      _provider.connected = isConnected;
      _provider.emit(isConnected ? EmitEvent.connect : EmitEvent.disconnect);
    } else if (jsonMsg.method === MessageMethod.changeAddress) {
      // console.error(
      //   `handleIncomingMessage::changeAddress jsonMsg: ${JSON.stringify(
      //     jsonMsg
      //   )}`
      // );
      const address = jsonMsg.params[0] as string;
      _provider.emit(EmitEvent.accountsChanged, [address]);
    } // else if (
    //   (jsonMsg.method as EnkryptProviderEventMethods) ===
    //   EnkryptProviderEventMethods.chainChanged
    // ) {
    //   console.error(
    //     `handleIncomingMessage::chainChanged jsonMsg: ${JSON.stringify(
    //       jsonMsg
    //     )}`
    //   );
    //   const networkName = jsonMsg.params[0] as string;
    //   if(networkName === NetworkNames.Tolar ||
    //     networkName === NetworkNames.TolarLocal ||
    //     networkName === NetworkNames.TolarTestnet ||
    //     networkName === NetworkNames.TolarStaging) {
    //     console.error(
    //       `handleIncomingMessage::Tolar network found jsonMsg: ${JSON.stringify(
    //         jsonMsg
    //       )}`
    //     );
    //
    //     await _provider.switchNetwork(networkName);
    //     _provider.emit(EmitEvent.networkChanged, [networkName]);
    //   }
    // }
    else if (jsonMsg.method === MessageMethod.changeNetwork) {
        // console.error(
        //   `handleIncomingMessage::changeNetworky jsonMsg: ${JSON.stringify(
        //     jsonMsg
        //   )}`
        // );
      const networkId = jsonMsg.params[0] as string;
      _provider.emit(EmitEvent.networkChanged, [networkId]);
    }
  } catch (e) {
    console.error(e);
  }
};

export { handleIncomingMessage };
