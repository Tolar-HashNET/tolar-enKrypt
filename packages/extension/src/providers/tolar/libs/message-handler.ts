import {
  TolarProvider,
  handleIncomingMessage as handleIncomingMessageType,
  EnkryptProviderEventMethods,
} from "@/types/provider";

import {
  EmitEvent,
  MessageMethod,
  ProviderMessage,
} from "@/providers/ethereum/types";
//import { findTolarNetwork } from "./network";

const handleIncomingMessage: handleIncomingMessageType = async (
  provider,
  message
): Promise<void> => {
  try {
    console.error(
      `!-- Tolar:handleIncomingMessage message: ${JSON.stringify(message)} --!`
    );
    const _provider = provider as TolarProvider;
    const jsonMsg = JSON.parse(message) as ProviderMessage;

    if (jsonMsg.method === MessageMethod.changeConnected) {
      console.error(
        `handleIncomingMessage::changeConnected jsonMsg: ${JSON.stringify(
          jsonMsg
        )}`
      );
      const isConnected = jsonMsg.params[0] as boolean;
      _provider.connected = isConnected;
      _provider.emit(isConnected ? EmitEvent.connect : EmitEvent.disconnect);
    } else if (jsonMsg.method === MessageMethod.changeAddress) {
      console.error(
        `handleIncomingMessage::changeAddress jsonMsg: ${JSON.stringify(
          jsonMsg
        )}`
      );
      const address = jsonMsg.params[0] as string;
      _provider.emit(EmitEvent.accountsChanged, [address]);
    } else if (
      (jsonMsg.method as EnkryptProviderEventMethods) ===
      EnkryptProviderEventMethods.chainChanged
    ) {
      console.error(
        `handleIncomingMessage::chainChanged jsonMsg: ${JSON.stringify(
          jsonMsg
        )}`
      );
      // const network = findTolarNetwork(jsonMsg.params[0]);
      // if (network) {
      //   await _provider.switchNetwork(network.networkId);
      //   _provider.emit(EmitEvent.networkChanged, [network.name]);
      // }
      await _provider.switchNetwork(1);
      _provider.emit(EmitEvent.networkChanged, ["kiki"]);
    }
  } catch (e) {
    console.error(e);
  }
};

export { handleIncomingMessage };
