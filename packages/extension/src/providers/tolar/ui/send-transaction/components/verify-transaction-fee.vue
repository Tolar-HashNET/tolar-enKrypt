<template>
  <div class="verify-transaction-fee-tol">
    <p class="verify-transaction-fee-tol__crypto">
      {{ gasFee }}
      <span>attoTOL</span>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  gasFee: {
    type: String,
    default: () => {
      return "";
    },
  },
});
</script>

<style lang="less">
@import '@action/styles/theme.less';

.verify-transaction-fee-tol {
  width: 100%;
  padding: 10px 16px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;

  &__crypto {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @tertiaryLabel;
    margin: 0;
  }
}
</style>
