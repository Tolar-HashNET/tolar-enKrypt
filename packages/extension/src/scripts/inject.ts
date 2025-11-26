import {
  setWindowNamespace,
  windowOnMessage,
  providerSendMessage,
} from '@/libs/messenger/window';
import { ProviderName, ProviderType } from '@/types/provider';
import TolarProvider from "@/providers/tolar/inject";

import { InternalMethods } from '@/types/messenger';

setWindowNamespace();

(window as Window).enkrypt = {
  providers: {},
  settings: {},
};

const loadInjectedProviders = () => {
  TolarProvider(window, {
    name: ProviderName.tolar,
    type: ProviderType.tolar,
    sendMessageHandler: providerSendMessage,
  });
};

loadInjectedProviders();

windowOnMessage(async (msg): Promise<void> => {
  window['enkrypt']['providers'][msg.provider].handleMessage(msg.message);
});

window.addEventListener('load', () => {
  providerSendMessage(
    ProviderName.enkrypt,
    JSON.stringify({ method: InternalMethods.newWindowInit }),
  );
});

window.addEventListener('beforeunload', () => {
  providerSendMessage(
    ProviderName.enkrypt,
    JSON.stringify({ method: InternalMethods.newWindowUnload }),
  );
});

console.info('Enkrypt: Hello from IN');
