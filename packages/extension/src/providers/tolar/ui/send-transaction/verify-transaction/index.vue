<template>
  <div class="container" :class="{ popup: isPopup }">
    <div v-if="!!selectedNetwork" class="verify-transaction">
      <custom-scrollbar
        ref="verifyScrollRef"
        class="verify-transaction__scroll-area"
      >
        <div class="verify-transaction__header" :class="{ popup: isPopup }">
          <h3>Verify Transaction</h3>
          <a v-if="!isPopup" class="verify-transaction__close" @click="close">
            <close-icon />
          </a>
        </div>
        <hardware-wallet-msg :wallet-type="account?.walletType" />

        <p class="verify-transaction__description" :class="{ popup: isPopup }">
          Double check the information and confirm transaction
        </p>
        <div
          class="verify-transaction__info"
          :class="{ popup: isPopup, border: isHasScroll() }"
        >
          <verify-transaction-network :network="network" />
          <verify-transaction-account
            :name="txData.fromAddressName"
            :address="network.displayAddress(txData.fromAddress)"
            :from="true"
            :network="network"
          />
          <verify-transaction-account
            :address="network.displayAddress(txData.toAddress)"
            :network="network"
          />
          <verify-transaction-amount :token="txData.toToken" />
          <verify-transaction-fee :gas-fee="txData.txFee.nativeValue" :currency-name="network.currencyName" />
        </div>
      </custom-scrollbar>

      <div class="verify-transaction__error">
        <send-alert v-show="errorMsg" :error-msg="errorMsg" />
      </div>

      <div
        class="verify-transaction__buttons"
        :class="{ popup: isPopup, border: isHasScroll() }"
      >
        <div class="verify-transaction__buttons-cancel">
          <base-button
            title="Back"
            :click="close"
            :gray="true"
            :disabled="isProcessing"
          />
        </div>
        <div class="verify-transaction__buttons-send">
          <base-button
            title="Confirm and send"
            :click="sendAction"
            :disabled="isProcessing"
          />
        </div>
      </div>
    </div>

    <send-process
      v-if="isProcessing"
      :is-done="isSendDone"
      :is-nft="false"
      :to-address="txData.toAddress"
      :network="network"
      :token="txData.toToken"
      :is-window-popup="isWindowPopup"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, ComponentPublicInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import VerifyTransactionNetwork from "@/providers/common/ui/verify-transaction/verify-transaction-network.vue";
import VerifyTransactionAccount from "@/providers/common/ui/verify-transaction/verify-transaction-account.vue";
import VerifyTransactionAmount from "@/providers/common/ui/verify-transaction/verify-transaction-amount.vue";
import VerifyTransactionFee from "../components/verify-transaction-fee.vue";
import SendAlert from "../components/send-alert.vue";
import HardwareWalletMsg from "@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue";
import SendProcess from "@action/views/send-process/index.vue";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { getCurrentContext } from "@/libs/messenger/extension";
import { VerifyTransactionParams } from "@/providers/tolar/ui/types";
import { DEFAULT_TOLAR_NETWORK, getNetworkByName } from "@/libs/utils/networks";
import { EnkryptAccount } from "@enkryptcom/types";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { BaseNetwork } from "@/types/base-network";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import { TolarToken } from "@/providers/tolar/types/tolar-token";
import TolarAPI from "@/providers/tolar/libs/api";
import { TolarNetwork } from "@/providers/tolar/types/tolar-network";
import { trackSendEvents } from "@/libs/metrics";
import { SendEventType } from "@/libs/metrics/types";
import { logError } from "@/providers/tolar/libs/utils";
import {
  TolAddress,
  TolPublicKey,
  TolTxBody,
} from "@tolar/web3-plugin-tolar";
import { sendRawTransaction } from "@/providers/tolar/ui/libs/signer";
import ActivityState from "@/libs/activity-state";

const isSendDone = ref(false);
const account = ref<EnkryptAccount>();
const tolarToken = ref<TolarToken>();
const KeyRing = new PublicKeyRing();
const route = useRoute();
const router = useRouter();
const selectedNetwork: string = route.query.id as string;
const txData: VerifyTransactionParams = JSON.parse(
  Buffer.from(route.query.txData as string, "base64").toString("utf8")
);
const errorMsg = ref("");
const isProcessing = ref(false);
const isPopup: boolean = getCurrentContext() === "new-window";
const isWindowPopup = ref(false);
const verifyScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
defineExpose({ verifyScrollRef });
const network = ref<BaseNetwork>(DEFAULT_TOLAR_NETWORK);

onBeforeMount(async () => {
  network.value = (await getNetworkByName(selectedNetwork))!;
  trackSendEvents(SendEventType.SendVerify, { network: network.value.name });
  account.value = await KeyRing.getAccount(txData.fromAddress);
  isWindowPopup.value = account.value.isHardware;
  tolarToken.value = new TolarToken({
    icon: network.value.icon,
    balance: "0",
    price: "0",
    name: "loading",
    symbol: "loading",
    decimals: network.value.decimals,
  });
});

const close = () => {
  if (getCurrentContext() === "popup") {
    router.go(-1);
  } else {
    window.close();
  }
};

const errorMsgReg = /gRPC\serror\scode:\s\d+;\smessage:\s(.+);\sdetails:.*/g;

const sendAction = async () => {
  const tolarNetwork = network.value as TolarNetwork;

  isProcessing.value = true;
  trackSendEvents(SendEventType.SendApprove, { network: tolarNetwork.name });

  let txHash = "";

  const txActivity: Activity = {
    from: txData.fromAddress,
    to: txData.toAddress,
    isIncoming: txData.fromAddress === txData.toAddress,
    network: tolarNetwork.name,
    status: ActivityStatus.pending,
    timestamp: new Date().getTime(),
    token: {
      decimals: txData.toToken.decimals,
      icon: txData.toToken.icon,
      name: txData.toToken.name,
      symbol: txData.toToken.symbol,
      price: txData.toToken.price,
    },
    type: ActivityType.transaction,
    value: txData.toToken.amount,
    transactionHash: txHash,
  };

  const activityState = new ActivityState();

  try {
    const tolarAPI = (await tolarNetwork.api()) as TolarAPI;
    const nonce = await tolarAPI.getNonce(txActivity.from);

    const signerId = new TolPublicKey(account.value!.publicKey);
    const sender = TolAddress.fromPublicKey(signerId.hexStr);

    const tolTxBody = new TolTxBody(
      sender,
      new TolAddress(txData.toAddress),
      BigInt(txData.toToken.amount),
      21000n,
      1n,
      "",
      BigInt(nonce),
      tolarNetwork.networkId
    );

    txHash = await sendRawTransaction(tolTxBody, account.value!, tolarAPI);
  } catch (e: unknown) {
    let error = logError(e);

    const res = errorMsgReg.exec(error);
    if(res !== null && res.length === 2) {
      error = res[1];
    }

    txActivity.status = ActivityStatus.failed;
    await activityState.addActivities([txActivity], {
      address: tolarNetwork.displayAddress(txData.fromAddress),
      network: tolarNetwork.name,
    });

    isProcessing.value = false;
    errorMsg.value = error;
    trackSendEvents(SendEventType.SendDecline, {
      network: tolarNetwork.name,
      error: errorMsg.value,
    });

    return;
  }

  trackSendEvents(SendEventType.SendComplete, {
    network: tolarNetwork.name,
  });

  await activityState.addActivities(
    [{ ...txActivity, ...{ transactionHash: txHash } }],
    {
      address: txData.fromAddress,
      network: tolarNetwork.name,
    }
  );

  isSendDone.value = true;
  if (getCurrentContext() === "popup") {
    setTimeout(() => {
      isProcessing.value = false;
      router.go(-2);
    }, 4500);
  } else {
    setTimeout(() => {
      isProcessing.value = false;
      window.close();
    }, 1500);
  }
};

const isHasScroll = () => {
  if (verifyScrollRef.value) {
    return verifyScrollRef.value.$el.classList.contains("ps--active-y");
  }

  return false;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;

  &.popup {
    box-shadow: none;
    padding: 0 23px;
  }
}

.verify-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;

    &.popup {
      padding: 24px 0 12px 0;
    }

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__description {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    padding: 4px 141px 16px 32px;
    margin: 0;

    &.popup {
      padding: 4px 0 16px 0;
    }
  }

  &__info {
    border: 1px solid @gray02;
    box-sizing: border-box;
    border-radius: 10px;
    margin: 0 32px 0 32px;

    &.popup {
      margin: 0;
      margin-bottom: 56px;
    }
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 8px 32px 32px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;
    font-size: 0;

    &.popup {
      padding: 24px;
      background: @white;
    }

    &.border {
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05),
        0px 0px 1px rgba(0, 0, 0, 0.25);
    }

    &-cancel {
      width: 170px;
    }

    &-send {
      width: 218px;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: calc(~"100% + 53px");
    height: calc(~"100% - 88px");
    margin: 0;
    padding: 0 53px 0 0 !important;
    margin-right: -53px;
    box-sizing: border-box;

    &.ps--active-y {
      padding-bottom: 0 !important;
    }

    & > .ps__rail-y {
      right: 0 !important;
    }
  }

  &__error {
    position: absolute;
    top: 480px;
    width: 100%;
    background-color: white;
  }
}
</style>
