import {handleIncomingMessage as handleIncomingMessageType, TolarProvider,} from "@/types/provider";
import {EmitEvent, MessageMethod, ProviderMessage} from "@/providers/tolar/types";

const handleIncomingMessage: handleIncomingMessageType = async (
  provider,
  message
): Promise<void> => {
  try {
    const _provider = provider as TolarProvider;
    const jsonMsg = JSON.parse(message) as ProviderMessage;

    if (jsonMsg.method === MessageMethod.changeConnected) {
      const isConnected = jsonMsg.params[0] as boolean;
      _provider.connected = isConnected;
      _provider.emit(isConnected ? EmitEvent.connect : EmitEvent.disconnect);
    } else if (jsonMsg.method === MessageMethod.changeAddress) {
      const address = jsonMsg.params[0] as string;
      _provider.emit(EmitEvent.accountsChanged, [address]);
    } else if (jsonMsg.method === MessageMethod.changeNetwork) {
      const networkId = jsonMsg.params[0] as string;
      _provider.emit(EmitEvent.networkChanged, [networkId]);
    }
  } catch (e) {
    console.error(e);
  }
};

export { handleIncomingMessage };
