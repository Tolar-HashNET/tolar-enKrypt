<template>
  <div>
    <settings-inner-header v-bind="$attrs" :is-about="true" />

    <settings-button
      title="Visit our website"
      :is-link="true"
      @click="siteAction"
    />
    <settings-button
      title="Join us on Telegram"
      :is-link="true"
      @click="telegramAction"
    />
    <settings-button
      title="Follow us on Twitter"
      :is-link="true"
      @click="twitterAction"
    />
    <settings-button
      title="LinkedIn"
      :is-link="true"
      @click="linkedinAction"
    />
  </div>
</template>

<script setup lang="ts">
import SettingsInnerHeader from '@action/views/settings/components/settings-inner-header.vue';
import SettingsButton from '@action/views/settings/components/settings-button.vue';

const siteAction = () => {
  window.open('https://tolar.io/', '_blank', 'noopener');
};

const telegramAction = () => {
  window.open('https://t.me/tolarofficial', '_blank', 'noopener');
};

const twitterAction = () => {
  window.open('https://x.com/tolarhashnet', '_blank', 'noopener');
};

const linkedinAction = () => {
  window.open('https://www.linkedin.com/company/tolar-io/posts/?feedView=all', '_blank', 'noopener');
};
</script>

<style lang="less">
@import '@action/styles/theme.less';
</style>
