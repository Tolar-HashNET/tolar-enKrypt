<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
      <div class="common-popup__network">
        <img :src="network.icon" />
        <p>{{ network.name_long }}</p>
      </div>
    </template>

    <template #content>
      <h2>Verify transaction</h2>
      <hardware-wallet-msg :wallet-type="account.walletType" />
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__account">
          <img :src="identicon" />
          <div class="provider-verify-transaction__account-info">
            <h4>{{ account.name }}</h4>
            <div>
              <p>
                {{
                  Balance == '~'
                    ? '~'
                    : $filters.formatFloatingPointValue(Balance).value
                }}
                <span>{{ network.currencyName }}</span>
              </p>
              <p>
                {{ $filters.replaceWithEllipsis(account.address, 6, 4) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__info">
          <img :src="Options.faviconURL" />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ Options.domain }}</h4>
          </div>
        </div>

        <div v-if="isApproval && tx" class="provider-verify-transaction__amount">
          <img :src="network.icon" />

          <div class="provider-verify-transaction__amount-info">
            <h4>
              {{
                $filters.formatFloatingPointValue(
                  fromBase(
                    TxValue || '0',
                    network.decimals || 18,
                  ),
                ).value
              }}
              <span>{{ network.currencyName }}</span>
            </h4>
          </div>
        </div>

        <div v-if="isApproval" class="provider-verify-transaction__error">
          <alert-icon />
          <p>
            Warning: you will allow this DApp to spend {{ approvalAmount }} of
            {{ network.currencyName }} at any time in
            the future. Please proceed only if you are trust this DApp.
          </p>
        </div>
      </div>

      <div class="provider-verify-transaction__message">
        <JsonTreeView
          v-if="txJson !== ''"
          :data="txJson"
          :max-depth="3"
          :root-key-string="'Transaction Data'"
        />
      </div>

      <p v-if="errorMsg != ''" class="provider-verify-transaction__error">
        {{ errorMsg }}
      </p>
    </template>

    <template #button-left>
      <base-button
        title="Decline"
        :click="deny"
        :no-background="true"
        :disabled="isProcessing"
      />
    </template>

    <template #button-right>
      <base-button
        title="Send"
        :click="approve"
        :disabled="isProcessing || errorMsg != ''"
      />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import {ref, ComponentPublicInstance, onBeforeMount, computed} from 'vue';
import SignLogo from '@action/icons/common/sign-logo.vue';
import BaseButton from '@action/components/base-button/index.vue';
import CommonPopup from '@action/views/common-popup/index.vue';
import HardwareWalletMsg from '@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue';
import { getError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { DEFAULT_TOLAR_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import { TolarNetwork } from '@/providers/tolar/types/tolar-network.ts';
import { ProviderRequestOptions } from '@/types/provider';
import { EnkryptAccount } from '@enkryptcom/types';
import { sendRawTransaction } from './libs/signer';
import { fromBase } from '@enkryptcom/utils';
import AlertIcon from '@action/icons/send/alert-icon.vue';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import TolarAPI from "@/providers/tolar/libs/api";
import { RpcTxRequest, TolTxBody } from "@tolar/web3-plugin-tolar";
import {JsonTreeView} from "@/libs/json-tree-view";
import ActivityState from "@/libs/activity-state";
import {Activity, ActivityStatus, ActivityType} from "@/types/activity.ts";
import {TolarToken} from "@/providers/tolar/types/tolar-token.ts";

const isProcessing = ref(false);
const providerVerifyTransactionScrollRef = ref<ComponentPublicInstance>();

const tx = ref<TolTxBody | null>(null);
const TxValue = ref<string>('0x0');
const TxFee = ref<string>("0");
const Balance = ref<string>('~');
const FiatValue = ref<string>('~');
const DataHex = ref<string>('0x');

const isApproval = ref(false);
const approvalAmount = ref('');
const network = ref<TolarNetwork>(DEFAULT_TOLAR_NETWORK);
const errorMsg = ref('');
const account = ref<EnkryptAccount>({
  name: '',
  address: '',
} as EnkryptAccount);
const identicon = ref<string>('');
const windowPromise = WindowPromiseHandler(3);
const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});

defineExpose({ providerVerifyTransactionScrollRef });

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  try {
    network.value = (await getNetworkByName(
      Request.value.params![2],
    )) as TolarNetwork;

    account.value = Request.value.params![1] as EnkryptAccount;
    identicon.value = network.value.identicon(account.value.address);
    Options.value = options;

    const api = (await network.value.api()) as TolarAPI;
    const balance = await api.getBalance(account.value.address);
    Balance.value = fromBase(balance, network.value.decimals);

    FiatValue.value = "0";
    const txBody = TolTxBody.fromRpcTxRequest(Request.value.params![0] as RpcTxRequest);

    tx.value = txBody;
    TxValue.value = txBody.value.toString();
    TxFee.value = (txBody.gas * txBody.gasPrice).toString();
    approvalAmount.value = fromBase(
      (txBody.gas * txBody.gasPrice + txBody.value).toString(),
      network.value.decimals,
    );

    if(txBody.data.length > 0) {
      DataHex.value = tx.value.data;
    }
  } catch (e: unknown) {
    if (typeof e === "string") {
      errorMsg.value = e;
    } else if (e instanceof Error) {
      errorMsg.value = e.message;
    }
  }

  isApproval.value = true;
});

const txJson = computed((): string => {
  return tx.value ? JSON.stringify(tx.value!.toPrintable()) : '';
});

const approve = async () => {
  isProcessing.value = true;

  trackSendEvents(SendEventType.SendAPIApprove, {
    network: network.value.name,
  });

  const { Resolve } = await windowPromise;
  const tolarAPI = (await network.value.api()) as TolarAPI;
  const tolTxBody: TolTxBody = tx.value!;

  const networkAssets = await network.value.getAllTokens(tolTxBody.senderAddress.hexStr);
  const networkAsset = networkAssets[0] as TolarToken;

  const activityState = new ActivityState();
  const txActivity: Activity = {
    from: tolTxBody.senderAddress.hexStr,
    to: tolTxBody.receiverAddress.hexStr,
    isIncoming: tolTxBody.senderAddress.hexStr === tolTxBody.receiverAddress.hexStr,
    network: network.value.name,
    status: ActivityStatus.pending,
    timestamp: new Date().getTime(),
    token: {
      decimals: networkAsset.decimals,
      icon: networkAsset.icon,
      name: networkAsset.name,
      symbol: networkAsset.symbol,
      price: networkAsset.price,
    },
    type: ActivityType.transaction,
    value: tolTxBody.value.toString(),
    transactionHash: "",
  };

  try {
    const txHash = await sendRawTransaction(tolTxBody, account.value!, tolarAPI);

    trackSendEvents(SendEventType.SendAPIComplete, {
      network: network.value.name,
    });

    await activityState.addActivities(
      [{ ...txActivity, ...{ transactionHash: txHash } }],
      {
        address: tolTxBody.senderAddress.hexStr,
        network: network.value.name,
      }
    );

    Resolve.value({result: JSON.stringify(txHash)});
  } catch (e : any) {
    txActivity.status = ActivityStatus.failed;
    await activityState.addActivities([txActivity], {
      address: tolTxBody.senderAddress.hexStr,
      network: network.value.name,
    });

    trackSendEvents(SendEventType.SendAPIComplete, {
      network: network.value.name,
      error: e.error,
    });
    Resolve.value(e);
  }
};

const deny = async () => {
  trackSendEvents(SendEventType.SendAPIDecline, {
    network: network.value.name,
  });
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>

<style lang="less">
@import '@action/styles/theme.less';
@import '@/providers/common/ui/styles/verify-transaction.less';
</style>
