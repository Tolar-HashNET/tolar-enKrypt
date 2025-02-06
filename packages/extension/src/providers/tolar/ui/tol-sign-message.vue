<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
    </template>

    <template #content>
      <h2>Sign message</h2>
      <hardware-wallet-msg :wallet-type="account.walletType" />
      <div class="common-popup__block">
        <div class="common-popup__account">
          <img :src="identicon" />
          <div class="common-popup__account-info">
            <h4>{{ account.name }}</h4>
            <p>
              {{
                $filters.replaceWithEllipsis(
                  account.address
                    ? network.displayAddress(account.address)
                    : '',
                  6,
                  4,
                )
              }}
            </p>
          </div>
        </div>
      </div>
      <div class="common-popup__block">
        <div class="common-popup__info">
          <img :src="Options.faviconURL" />
          <div class="common-popup__info-info">
            <h4>{{ Options.title }}</h4>
            <p>{{ Options.domain }}</p>
          </div>
        </div>

        <p class="common-popup__message">
          {{ message }}
        </p>
      </div>
    </template>

    <template #button-left>
      <base-button title="Cancel" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Sign" :click="approve" :disabled="isProcessing" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import SignLogo from '@action/icons/common/sign-logo.vue';
import BaseButton from '@action/components/base-button/index.vue';
import CommonPopup from '@action/views/common-popup/index.vue';
import { getError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { onBeforeMount, ref } from 'vue';
import { DEFAULT_TOLAR_NETWORK, getNetworkByName} from '@/libs/utils/networks';
import { ProviderRequestOptions } from '@/types/provider';
import { TolarNetwork } from '../types/tolar-network';
import { EnkryptAccount } from '@enkryptcom/types';
import { TolarSigner } from './libs/signer';
import { getRTLOLTLOSafeString } from '@/libs/utils/unicode-detection';

const windowPromise = WindowPromiseHandler(3);
const network = ref<TolarNetwork>(DEFAULT_TOLAR_NETWORK);
const account = ref<EnkryptAccount>({
  name: '',
  address: '',
} as EnkryptAccount);

const identicon = ref<string>('');
const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});

const message = ref<string>('');
const type = ref<string>('');
const isProcessing = ref(false);

onBeforeMount(async () => {
  //console.error("!-- TOL SIGN MESSAGE --!");

  const { Request, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![2],
  )) as TolarNetwork;
  account.value = Request.value.params![1] as EnkryptAccount;
  identicon.value = network.value.identicon(account.value.address);
  Options.value = options;
  message.value = getRTLOLTLOSafeString(Request.value.params![0]);
  type.value = Request.value.params![1];
});

const approve = async () => {
  const { Request, Resolve } = await windowPromise;
  const requestMessage = Request.value.params![0] as string;
  isProcessing.value = true;

  try {
    const signedMessage = await TolarSigner({
      account: account.value,
      payload: requestMessage,
    });

    Resolve.value({result: JSON.stringify(signedMessage)});
  } catch (e: any) {
    Resolve.value(e);
  }
};

const deny = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>

<style lang="less" scoped>
@import '@/providers/ethereum/ui/styles/common-popup.less';
</style>
