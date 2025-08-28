<template>
  <div>
    <settings-header v-bind="$attrs" />

    <div class="settings__block">
      <settings-button
        title="Contact support"
        :is-link="true"
        @click="contactSupport"
      />
    </div>

    <div class="settings__block">
      <settings-button title="About" @click="$emit('action:about')" />
    </div>

    <div class="settings__block">
      <settings-button title="View my recovery phrase" @click="toggleSign" />
      <settings-button
        title="Reset wallet"
        :is-red="true"
        @click="$emit('action:reset')"
      />
    </div>

    <div class="settings__copyright">
      <p>Version {{ version }} ({{ buildTime }})</p>
      <p>© {{ new Date().getFullYear() }} by Tolar.io Inc.</p>
    </div>

    <modal-sign
      v-if="isOpenSign"
      :is-unlock="true"
      v-bind="$attrs"
      @window:close="toggleSign"
      @toggle:forgot="toggleForgot"
    />

    <modal-forgot
      v-if="isForgot"
      :is-forgot="isForgot"
      @toggle:forgot="toggleForgot"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SettingsHeader from '@action/views/settings/components/settings-header.vue';
import SettingsButton from '@action/views/settings/components/settings-button.vue';
import ModalSign from '@action/views/modal-sign/index.vue';
import ModalForgot from '@action/views/modal-forgot/index.vue';

const isOpenSign = ref(false);
const isForgot = ref(false);
const version = __PACKAGE_VERSION__;
const buildTime = __BUILD_TIME__;
defineEmits<{
  (e: 'action:reset'): void;
  (e: 'action:about'): void;
}>();

const contactSupport = () => {
  window.open(
    'https://t.me/tolarofficial',
    '_blank',
    'noopener',
  );
};

const toggleSign = () => {
  isOpenSign.value = !isOpenSign.value;
};
const toggleForgot = () => {
  isOpenSign.value = false;
  isForgot.value = !isForgot.value;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.settings {
  &__copyright {
    padding: 0 48px;

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @tertiaryLabel;
      margin: 0;
    }
  }
}
</style>
