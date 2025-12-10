import packageJson from '../../package.json';

const { version } = packageJson;

export default {
  homepage_url: 'https://www.tolar.io',
  version,
  name: 'Taquin: Tolar Wallet',
  short_name: 'Taquin',
  description: 'The best Tolar crypto wallet',
  permissions: [
    'storage',
    'unlimitedStorage',
    'tabs',
    'clipboardRead',
    'clipboardWrite',
  ],
  action: {
    default_icon: {
      '16': 'assets/img/icons/icon16.png',
      '32': 'assets/img/icons/icon32.png',
      '64': 'assets/img/icons/icon64.png',
      '192': 'assets/img/icons/icon192.png',
    },
    default_title: 'Taquin',
    default_popup: 'action.html',
  },
  content_scripts: [],
  icons: {
    16: 'assets/img/icons/icon16.png',
    32: 'assets/img/icons/icon32.png',
    64: 'assets/img/icons/icon64.png',
    192: 'assets/img/icons/icon192.png',
  },
};
