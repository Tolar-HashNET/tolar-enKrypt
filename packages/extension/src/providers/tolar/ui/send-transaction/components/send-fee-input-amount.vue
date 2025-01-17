<template>
  <div class="send-input-fee-amount" :class="{ focus: isFocus }">
    <span>Gas:</span>
    <input
      ref="inputRef"
      v-model="feeAmount"
      type="text"
      placeholder="0"
      :style="{ color: !hasEnoughBalance ? 'red' : 'black' }"
      @keypress="onlyNumber"
      @focus="changeFocus"
      @blur="changeFocus"
    />
    <span>attoTOL</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, ComponentPublicInstance } from "vue";

const emit = defineEmits<{
  (e: "update:inputFeeAmount", value: string): void;
}>();

const isFocus = ref(false);
const inputRef = ref<ComponentPublicInstance<HTMLInputElement>>();

defineExpose({ inputRef });

const props = defineProps({
  hasEnoughBalance: {
    type: Boolean,
    default: true,
  },
  feeAmount: {
    type: String,
    default: "21000",
  },
});

const feeAmount = computed({
  get: () => props.feeAmount,
  set: (value) => {
    let fValue = value.toString();
    if (fValue === ".") fValue = "0.";
    emit("update:inputFeeAmount", fValue);
  },
});

const onlyNumber = ($event: KeyboardEvent) => {
  const keyCode = $event.keyCode ? $event.keyCode : $event.which;
  if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
    $event.preventDefault();
  }
};

const changeFocus = () => {
  isFocus.value = !isFocus.value;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.send-input-fee-amount {
  height: 40px;
  background: #ffffff;
  margin: 12px 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;

  &.focus {
    border: 2px solid @primary;
    width: calc(~"100% - 62px");
    margin: 12px 31px 8px 31px;
  }

  input {
    width: 290px;
    height: 24px;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    border: 0 none;
    outline: none;
    padding: 0 8px;
  }

  span {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    letter-spacing: 0.25px;
    color: @tertiaryLabel;
  }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
}
</style>
