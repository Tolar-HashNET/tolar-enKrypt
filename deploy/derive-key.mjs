// Derives private keys from your recovery phrase (mnemonic).
// Run: node derive-key.mjs
// Then copy the matching private key into your .env file.

import 'dotenv/config';
import { HDNodeWallet } from 'ethers';
import { account as tolAccount } from '@tolar/web3-plugin-tolar';

const phrase = process.env.MNEMONIC;

if (!phrase) {
  console.error('ERROR: Add MNEMONIC="word1 word2 ... word12" to your .env file');
  process.exit(1);
}

console.log('Checking first 6 account indices...\n');
console.log('─'.repeat(80));

for (let i = 0; i < 6; i++) {
  const wallet = HDNodeWallet.fromPhrase(phrase.trim(), undefined, `m/44'/60'/0'/0/${i}`);
  const privateKey = wallet.privateKey;
  const tolarAddress = tolAccount.privateKeyToAddress(privateKey);
  console.log(`Index ${i}:`);
  console.log(`  Tolar address: ${tolarAddress}`);
  console.log(`  Private key:   ${privateKey}`);
  console.log('─'.repeat(80));
}

console.log('\nFind the address that matches your Taquin wallet and copy its private key into .env as PRIVATE_KEY=...');
