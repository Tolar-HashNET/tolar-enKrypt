<template>
  <div class="container">
    <div class="add-custom-token">
      <div class="add-custom-token__header">
        <h3>Add a token</h3>
        <a class="add-custom-token__close" @click="close">
          <close-icon />
        </a>
      </div>

      <div class="add-custom-token__contract-input" :class="{ focus: isFocus }">
        <div class="add-custom-token__contract-input__address">
          <p>Contract address (0x54...):</p>
          <input
            v-model="contractAddress"
            type="text"
            placeholder="0x54..."
            @focus="isFocus = true"
            @blur="isFocus = false"
          />
        </div>
      </div>

      <div v-if="isLoading" class="add-custom-token__loading">
        <p>Looking up token...</p>
      </div>

      <div v-else-if="tokenInfo">
        <div class="add-custom-token__token-info">
          <div class="add-custom-token__token-info__image">
            <img :src="props.network.icon" alt="" />
          </div>
          <div class="add-custom-token__token-info__info">
            <h5>{{ tokenInfo.name }}</h5>
            <p>{{ formattedBalance }} <span>{{ tokenInfo.symbol }}</span></p>
          </div>
        </div>
        <div class="add-custom-token__warning">
          <warn-icon />
          <p>
            Be sure to validate this is the token you think it is! Anyone can
            deploy a token with any name.
          </p>
        </div>
      </div>

      <div v-else-if="notFound && isValidAddress">
        <div class="add-custom-token__error">
          <alert-icon />
          <p>
            No ERC20 token found at this address. Check the address and make
            sure you are on the correct network.
          </p>
        </div>
      </div>

      <div class="add-custom-token__buttons">
        <div class="add-custom-token__buttons-send">
          <base-button
            title="Add token"
            :disabled="!tokenInfo"
            :click="addToken"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { fromBase } from "@enkryptcom/utils";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";
import { TokensState } from "@/libs/tokens-state";
import { TokenType, CustomErc20Token } from "@/libs/tokens-state/types";
import { AssetsType } from "@/types/provider";
import { TolarNetwork } from "@/providers/tolar/types/tolar-network";
import TolarAPI from "@/providers/tolar/libs/api";
import { Erc20TokenInfo } from "@/providers/tolar/libs/erc20";
import CloseIcon from "@/ui/action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import AlertIcon from "@action/icons/send/alert-icon.vue";
import WarnIcon from "@action/icons/send/warning-icon.vue";

interface IProps {
  network: TolarNetwork;
  address: string;
}

const emits = defineEmits<{
  (e: "update:close"): void;
  (e: "update:token-added", asset: AssetsType): void;
}>();

const props = defineProps<IProps>();

const tokensState = new TokensState();

const contractAddress = ref("");
const tokenInfo = ref<Erc20TokenInfo | null>(null);
const rawBalance = ref("0");
const isLoading = ref(false);
const notFound = ref(false);
const isFocus = ref(false);

const TOLAR_ADDRESS_LENGTH = 52; // 0x + 50 hex chars

const isValidAddress = computed(() =>
  contractAddress.value.startsWith("0x54") &&
  contractAddress.value.length === TOLAR_ADDRESS_LENGTH
);

const formattedBalance = computed(() => {
  if (!tokenInfo.value) return "0";
  return formatFloatingPointValue(
    fromBase(rawBalance.value, tokenInfo.value.decimals)
  ).value;
});

watch(contractAddress, async (addr) => {
  tokenInfo.value = null;
  notFound.value = false;
  rawBalance.value = "0";

  if (!isValidAddress.value) return;

  isLoading.value = true;
  try {
    const api = (await props.network.api()) as TolarAPI;
    const info = await api.getErc20TokenInfo(addr, props.network.networkId);

    if (info) {
      tokenInfo.value = info;
      rawBalance.value = await api.getErc20Balance(
        addr,
        props.address,
        props.network.networkId
      );
    } else {
      notFound.value = true;
    }
  } finally {
    isLoading.value = false;
  }
});

const close = () => emits("update:close");

const addToken = async () => {
  if (!tokenInfo.value || !isValidAddress.value) return;

  const token: CustomErc20Token = {
    address: contractAddress.value as `0x${string}`,
    name: tokenInfo.value.name,
    symbol: tokenInfo.value.symbol,
    decimals: tokenInfo.value.decimals,
    icon: props.network.icon,
    type: TokenType.ERC20,
  };

  await tokensState.addErc20Token(props.network.name, token);

  const asset: AssetsType = {
    name: token.name,
    symbol: token.symbol,
    balance: rawBalance.value,
    balancef: formattedBalance.value,
    balanceUSD: 0,
    balanceUSDf: "0",
    value: "0",
    valuef: "0",
    decimals: token.decimals,
    contract: token.address,
    icon: token.icon,
    sparkline: "",
    priceChangePercentage: 0,
  };

  emits("update:token-added", asset);
  emits("update:close");
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 600px;
  background-color: @overlayBg !important;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}

.add-custom-token {
  width: 460px;
  height: 385px;
  box-sizing: border-box;
  position: relative;
  border-radius: 12px;
  background-color: white;

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
    &:hover { background: @black007; }
  }

  &__loading {
    margin: 12px 32px;
    color: @secondaryLabel;
    font-size: 14px;
  }

  &__contract-input {
    height: 64px;
    background: #ffffff;
    margin: 12px 32px 8px 32px;
    box-sizing: border-box;
    border: 1px solid @gray02;
    border-radius: 10px;
    width: calc(~'100% - 64px');
    padding: 16px;
    display: flex;
    align-items: center;

    &.focus {
      border: 2px solid @primary;
      width: calc(~'100% - 62px');
      margin: 12px 31px 8px 31px;
    }

    &__address {
      width: 100%;
      p {
        font-size: 12px;
        line-height: 16px;
        color: @secondaryLabel;
        margin: 0;
      }
      input {
        width: 100%;
        height: 24px;
        font-size: 16px;
        line-height: 24px;
        color: @primaryLabel;
        border: 0 none;
        outline: none;
        padding: 0;
      }
    }
  }

  &__token-info {
    height: 64px;
    background: #ffffff;
    margin: 0 32px 8px 32px;
    box-sizing: border-box;
    border: 1px solid @gray02;
    border-radius: 10px;
    width: calc(~'100% - 64px');
    padding: 16px;
    display: flex;
    align-items: center;

    &__image {
      background: @buttonBg;
      width: 32px;
      height: 32px;
      border-radius: 100%;
      overflow: hidden;
      margin-right: 12px;
      img { width: 100%; height: 100%; }
    }

    &__info {
      h5 {
        font-size: 16px;
        line-height: 24px;
        color: @primaryLabel;
        margin: 0 0 1px 0;
        font-weight: 400;
      }
      p {
        font-size: 12px;
        color: @secondaryLabel;
        margin: 0;
        span { font-variant: small-caps; }
      }
    }
  }

  &__error {
    margin: 12px 32px 8px 32px;
    background: @error01;
    border-radius: 10px;
    padding: 12px 16px 12px 57px;
    position: relative;
    svg { position: absolute; left: 16px; top: 50%; margin-top: -12px; }
    p { font-size: 14px; color: @error; margin: 0; line-height: 20px; }
  }

  &__warning {
    margin: 12px 32px 8px 32px;
    background: @orange01;
    border-radius: 10px;
    padding: 12px 16px 12px 57px;
    position: relative;
    svg { position: absolute; left: 16px; top: 50%; margin-top: -12px; }
    p { font-size: 14px; color: @orange; margin: 0; line-height: 20px; }
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 32px 16px 32px;
    width: 100%;
    box-sizing: border-box;

    &-send { width: 100%; }
  }
}
</style>
