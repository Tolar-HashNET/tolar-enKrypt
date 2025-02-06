import EventEmitter from "eventemitter3";
import {handleIncomingMessage} from "./libs/message-handler";
import {EthereumRequest, EthereumResponse} from "@/providers/ethereum/types";
import {ProviderInterface, ProviderName, ProviderOptions, ProviderType, SendMessageHandler,} from "@/types/provider";
import {EnkryptWindow} from "@/types/globals";
import {TolarNetworks} from "./types";

export class Provider extends EventEmitter implements ProviderInterface {
  connected: boolean;
  name: ProviderName;
  type: ProviderType;
  version = __VERSION__;
  autoRefreshOnNetworkChange = false;
  networks: typeof TolarNetworks;
  sendMessageHandler: SendMessageHandler;

  constructor(options: ProviderOptions) {
    //console.error("!-- PRE TolarInjectProvider:constructor called --!");
    super();
    //console.error("!-- TolarInjectProvider:constructor called --!");
    this.connected = true;
    this.name = options.name;
    this.type = options.type;
    this.networks = TolarNetworks;
    this.sendMessageHandler = options.sendMessageHandler;
  }

  async request(request: EthereumRequest): Promise<EthereumResponse> {
    // console.error(
    //   `!-- TolarInjectProvider:request called request: ${JSON.stringify(
    //     request
    //   )} --!`
    // );

    return (await this.sendMessageHandler(
      this.name,
      JSON.stringify(request)
    )) as EthereumResponse;
  }

  isConnected(): boolean {
    return this.connected;
  }

  handleMessage(msg: string): void {
    // console.error(
    //   `!-- TolarInjectProvider:handleMessage called msg: ${JSON.stringify(
    //     msg
    //   )} --!`
    // );

    handleIncomingMessage(this, msg);
  }
}

const injectDocument = (
  document: EnkryptWindow | Window,
  options: ProviderOptions
): void => {
  const provider = new Provider(options);
  document["enkrypt"]["providers"][options.name] = provider;
};

export default injectDocument;
