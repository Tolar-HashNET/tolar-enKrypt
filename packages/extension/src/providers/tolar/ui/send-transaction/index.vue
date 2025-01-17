<template>
  <div class="container">
    <div v-if="!!selected" class="send-transaction">
      <div class="send-transaction__header">
        <h3>Send</h3>
        <a class="send-transaction__close" @click="close">
          <close-icon />
        </a>
      </div>

      <send-address-input
        ref="addressInputFrom"
        :from="true"
        :value="addressFrom"
        :network="network"
        :disable-direct-input="true"
        :is-address="true"
        @click="toggleSelectContactFrom(true)"
        @update:input-address="inputAddressFrom"
        @toggle:show-contacts="toggleSelectContactFrom"
      />

      <send-from-contacts-list
        :show-accounts="isOpenSelectContactFrom"
        :account-info="accountInfo"
        :address="addressFrom"
        :network="network"
        @selected:account="selectAccountFrom"
        @close="toggleSelectContactFrom"
      />

      <send-address-input
        ref="addressInputTo"
        :value="addressTo"
        :network="network"
        :is-address="fieldsValidation.addressTo"
        @update:input-address="inputAddressTo"
        @toggle:show-contacts="toggleSelectContactTo"
      />

      <send-contacts-list
        :show-accounts="isOpenSelectContactTo"
        :account-info="accountInfo"
        :address="addressTo"
        :network="network"
        @selected:account="selectAccountTo"
        @update:paste-from-clipboard="addressInputTo.pasteFromClipboard()"
        @close="toggleSelectContactTo"
      />

      <send-token-select
        :token="selectedAsset"
        @update:toggle-token-select="toggleSelectToken"
      />

      <assets-select-list
        v-show="isOpenSelectToken"
        :is-send="true"
        :assets="accountAssets"
        :is-loading="isLoadingAssets"
        @close="toggleSelectToken"
        @update:select-asset="selectToken"
      />

      <send-input-amount
        :amount="amount"
        :show-max="true"
        :fiat-value="selectedAsset.price"
        :has-enough-balance="fieldsValidation.amount"
        @update:input-amount="inputAmount"
        @update:input-set-max="setSendMax"
      />

      <send-fee-input-amount
        :fee-amount="feeAmount"
        :show-max="true"
        :has-enough-balance="fieldsValidation.feeAmount"
        @update:input-fee-amount="inputFeeAmount"
      />

      <send-alert v-show="errorMsg" :error-msg="errorMsg" />

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :no-background="true" />
        </div>
        <div class="send-transaction__buttons-send">
          <base-button
            :title="sendButtonTitle"
            :click="sendAction"
            :disabled="isDisabled"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SendAddressInput from "./components/send-address-input.vue";
import SendContactsList from "@/providers/common/ui/send-transaction/send-contacts-list.vue";
import SendFromContactsList from "@/providers/common/ui/send-transaction/send-from-contacts-list.vue";
import SendTokenSelect from "./components/send-token-select.vue";
import AssetsSelectList from "@action/views/assets-select-list/index.vue";
import SendInputAmount from "@/providers/common/ui/send-transaction/send-input-amount.vue";
import SendAlert from "./components/send-alert.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { AccountsHeaderData } from "@action/types/account";
import { toBN } from "web3-utils";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";
import { toBase, isValidDecimals, fromBase } from "@enkryptcom/utils";
import BigNumber from "bignumber.js";
import { VerifyTransactionParams } from "@/providers/tolar/ui/types";
import { routes as RouterNames } from "@/ui/action/router";
import { TolarToken } from "@/providers/tolar/types/tolar-token";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { TolarNetwork } from "@/providers/tolar/types/tolar-network";
import TolarAPI from "@/providers/tolar/libs/api";
import SendFeeInputAmount from "@/providers/tolar/ui/send-transaction/components/send-fee-input-amount.vue";

const props = defineProps({
  network: {
    type: Object as PropType<TolarNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const route = useRoute();
const router = useRouter();
const errorMsg = ref("");

const addressInputTo = ref();
const addressInputFrom = ref();
const isOpenSelectContactFrom = ref(false);
const isOpenSelectContactTo = ref(false);
const addressFrom = ref(props.accountInfo.selectedAccount!.address);
const addressTo = ref("");
const isOpenSelectToken = ref(false);
const amount = ref<string>();
const feeAmount = ref<string>();
const accountAssets = ref<TolarToken[]>([]);
const selectedAsset = ref<TolarToken | Partial<TolarToken>>(
  new TolarToken({
    icon: props.network.icon,
    balance: "0",
    price: "0",
    name: "loading",
    symbol: "loading",
    decimals: props.network.decimals,
  })
);
const sendMax = ref(false);

const fieldsValidation = ref({
  addressTo: false,
  amount: false,
  feeAmount: false,
});

const selected: string = route.params.id as string;
const isLoadingAssets = ref(true);

const isAddress = computed(() => {
  return addressTo.value.length > 3 && addressTo.value.length < 256;
});

onMounted(() => {
  isLoadingAssets.value = true;
  fetchTokens();
});

const validateFields = async () => {
  errorMsg.value = "";
  fieldsValidation.value = {
    addressTo: true,
    amount: true,
    feeAmount: true,
  };

  if (feeAmount.value === undefined) {
    feeAmount.value = "21000";
  }

  if (!selectedAsset.value) {
    return;
  }

  try {
    if (isAddress.value) {
      if (addressTo.value == addressFrom.value) {
        fieldsValidation.value.addressTo = false;
        errorMsg.value = '"To" address cannot be the same as "From" address';
        return;
      }
    } else {
      fieldsValidation.value.addressTo = false;
      return;
    }

    let rawAmount = toBN(toBase("0", selectedAsset.value.decimals!));
    const minAmount = toBN(toBase("0.000001", props.network.decimals));
    if (amount.value) {
      if (!isValidDecimals(amount.value, selectedAsset.value.decimals!)) {
        fieldsValidation.value.amount = false;
        errorMsg.value = `Amount cannot have more than ${selectedAsset.value.decimals} decimals`;
        return;
      }

      rawAmount = toBN(
        toBase(amount.value.toString(), selectedAsset.value.decimals!)
      );

      if (rawAmount.lt(minAmount)) {
        fieldsValidation.value.amount = false;
        errorMsg.value = "Amount must be greater than 0.000001";
        return;
      }

      const feeAtto = BigInt(feeAmount.value!);
      if (feeAtto < 21000n) {
        fieldsValidation.value.feeAmount = false;
        errorMsg.value =
          "Fee amount must be greater than or equal to 21000 attoTOL";
        return;
      }
    }
  } catch (error: any) {
    errorMsg.value = error.message || "An error occurred";
  }
};

watch([selectedAsset, addressTo, amount, feeAmount], validateFields);

watch(addressFrom, () => {
  fetchTokens();
});

const fetchTokens = async () => {
  console.error("!-- fetchTokens CALLED --!");

  const networkApi = (await props.network.api()) as TolarAPI;
  const networkAssets = await props.network.getAllTokens(addressFrom.value);
  const pricePromises = networkAssets.map((asset) => asset.getLatestPrice());
  const balancePromises = networkAssets.map((asset) => {
    if (!asset.balance) {
      console.error(
        `!-- fetchTokens, addressFrom: ${addressFrom.value}; addressTo: ${addressTo.value} --!`
      );
      return networkApi.getBalance(addressFrom.value);
    }

    return Promise.resolve(asset.balance);
  });

  Promise.all([...pricePromises, ...balancePromises]).then(() => {
    console.error(`!-- fetchTokens ALL PROMISES RESOLVED --!`);

    const nonZeroAssets = networkAssets.filter(
      (asset) => !toBN(asset.balance ?? "0").isZero()
    );

    if (nonZeroAssets.length == 0) {
      nonZeroAssets.push(networkAssets[0]);
    }

    selectedAsset.value = nonZeroAssets[0] as TolarToken;
    accountAssets.value = nonZeroAssets as TolarToken[];

    isLoadingAssets.value = false;
  });
};

const close = () => {
  router.go(-1);
};

const inputAddressFrom = (text: string) => {
  addressFrom.value = text;
};

const inputAddressTo = (text: string) => {
  addressTo.value = text;
};

const toggleSelectContactFrom = (open: boolean) => {
  isOpenSelectContactFrom.value = open;
};

const toggleSelectContactTo = (open: boolean) => {
  isOpenSelectContactTo.value = open;
};

const toggleSelectToken = () => {
  isOpenSelectToken.value = !isOpenSelectToken.value;
};

const selectAccountFrom = (account: string) => {
  addressFrom.value = account;
  isOpenSelectContactFrom.value = false;
};

const selectAccountTo = (account: string) => {
  addressTo.value = account;
  isOpenSelectContactTo.value = false;
};

const selectToken = (token: TolarToken | Partial<TolarToken>) => {
  selectedAsset.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (inputAmount: string) => {
  if (inputAmount === "") {
    inputAmount = "0";
  }
  const inputAmountBn = new BigNumber(inputAmount);
  sendMax.value = false;
  amount.value = inputAmountBn.lt(0) ? "0" : inputAmount;
};

const inputFeeAmount = (inputFeeAmount: string) => {
  feeAmount.value = inputFeeAmount;
};

const sendButtonTitle = computed(() => {
  let title = "Send";

  if (!isDisabled.value && amount.value)
    title =
      "Send " +
      formatFloatingPointValue(amount.value!).value +
      " " +
      selectedAsset.value?.symbol!.toUpperCase();

  return title;
});

const setSendMax = () => {
  sendMax.value = true;
  validateFields();
};

const isDisabled = computed(() => {
  return (
    !addressTo.value ||
    !amount.value ||
    !fieldsValidation.value.amount ||
    !fieldsValidation.value.addressTo ||
    !fieldsValidation.value.feeAmount
  );
});

const sendAction = async () => {
  const keyring = new PublicKeyRing();

  const fromAccount = await keyring.getAccount(addressFrom.value);

  const nativeAsset = accountAssets.value[0];
  const txFeeHuman = fromBase(feeAmount.value!, nativeAsset.decimals!);
  const txPrice = new BigNumber(nativeAsset.price!).times(txFeeHuman);
  const txFee = {
    fiatSymbol: "USD",
    fiatValue: txPrice.toString(),
    nativeSymbol: nativeAsset.symbol ?? "",
    nativeValue: feeAmount.value!,
  };

  const txVerifyInfo: VerifyTransactionParams = {
    TransactionData: {
      from: fromAccount.address,
      to: addressTo.value,
      data: "0x" as `0x{string}`,
      value: amount.value!,
    },
    toToken: {
      amount: toBase(amount.value!, selectedAsset.value.decimals!),
      decimals: selectedAsset.value.decimals!,
      icon: selectedAsset.value.icon as string,
      symbol: selectedAsset.value.symbol || "unknown",
      valueUSD: new BigNumber(selectedAsset.value.price || "0")
        .times(amount.value!)
        .toFixed(),
      name: selectedAsset.value.name || "",
      price: selectedAsset.value.price || "0",
    },
    networkId: props.network.networkId,
    fromAddress: fromAccount.address,
    fromAddressName: fromAccount.name,
    txFee,
    toAddress: addressTo.value,
  };

  const routedRoute = router.resolve({
    name: RouterNames.verify.name,
    query: {
      id: selected,
      txData: Buffer.from(JSON.stringify(txVerifyInfo), "utf8").toString(
        "base64"
      ),
    },
  });

  await router.push(routedRoute);
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
  position: relative;
}

.send-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;

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
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 32px 32px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;

    &-cancel {
      width: 170px;
    }

    &-send {
      width: 218px;
    }
  }
}
</style>
