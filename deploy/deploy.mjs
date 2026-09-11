import "dotenv/config";
import { readFileSync } from "fs";
import { Web3 } from "web3";
import {
  TolarPlugin,
  TolTxBody,
  TolTx,
  TolAddress,
  ZERO_HEX_ADDRESS,
  NetworkId,
} from "@tolar/web3-plugin-tolar";
import { account as tolAccount } from "@tolar/web3-plugin-tolar";
import solc from "solc";

// ── Config ──────────────────────────────────────────────────────────────────

const TESTNET_RPC = "https://jsongw.testnet.tolar.io/jsonrpc";
const NETWORK_ID = NetworkId.Testnet; // 2

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_NAME = process.env.TOKEN_NAME ?? "TestToken";
const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL ?? "TTK";
const TOKEN_SUPPLY = Number(process.env.TOKEN_SUPPLY ?? "1000000");

if (!PRIVATE_KEY) {
  console.error("ERROR: Set PRIVATE_KEY in .env (see .env.example)");
  process.exit(1);
}

// ── Compile ──────────────────────────────────────────────────────────────────

function compile() {
  const source = readFileSync("./contracts/TestToken.sol", "utf8");

  const input = JSON.stringify({
    language: "Solidity",
    sources: { "TestToken.sol": { content: source } },
    settings: {
      outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } },
      evmVersion: "london",
    },
  });

  const output = JSON.parse(solc.compile(input));

  if (output.errors?.some((e) => e.severity === "error")) {
    console.error("Compilation errors:");
    output.errors.forEach((e) => console.error(e.formattedMessage));
    process.exit(1);
  }

  const contract = output.contracts["TestToken.sol"]["TestToken"];
  return { abi: contract.abi, bytecode: contract.evm.bytecode.object };
}

// ── Deploy ───────────────────────────────────────────────────────────────────

async function deploy() {
  console.log("Compiling TestToken.sol...");
  const { abi, bytecode } = compile();
  console.log("Compiled OK");

  // Connect to Tolar testnet
  const web3 = new Web3(TESTNET_RPC);
  web3.registerPlugin(new TolarPlugin());

  // Derive the Tolar address from the private key
  const senderAddress = tolAccount.privateKeyToAddress(PRIVATE_KEY);
  console.log(`Deployer Tolar address: ${senderAddress}`);

  // Encode constructor arguments: (string name, string symbol, uint256 supply)
  const constructorAbi = abi.find((x) => x.type === "constructor");
  const encodedArgs = web3.eth.abi.encodeParameters(
    constructorAbi.inputs.map((i) => i.type),
    [TOKEN_NAME, TOKEN_SYMBOL, TOKEN_SUPPLY],
  );

  // Full deployment data = bytecode + encoded constructor args (strip leading 0x)
  const deployData = "0x" + bytecode + encodedArgs.slice(2);

  // Get current nonce
  const nonce = await web3.tolar.getNonce(senderAddress);
  console.log(`Nonce: ${nonce}`);

  // Use a fixed gas limit
  const gas = "2000000";
  console.log(`Gas limit: ${gas}`);

  // Build and sign the deployment transaction
  const txBody = new TolTxBody(
    new TolAddress(senderAddress),
    new TolAddress(ZERO_HEX_ADDRESS), // zero address = deploy new contract
    0n, // no TOL sent
    BigInt(gas),
    1n, // gas price
    deployData,
    BigInt(nonce),
    NETWORK_ID,
  );

  const signedTx = TolTx.fromBody(txBody, PRIVATE_KEY);
  console.log("Transaction signed, sending...");

  // Broadcast
  const txHash = await web3.tolar.sendSignedTransaction(signedTx.rawSignedTx);
  console.log(`Transaction sent: ${txHash}`);

  // Wait for confirmation
  console.log("Waiting for confirmation...");
  let receipt = null;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      receipt = await web3.tolar.getTransactionReceipt(txHash);
      if (receipt) break;
    } catch {
      // not confirmed yet
    }
  }

  if (!receipt) {
    console.error(
      "Transaction not confirmed within 60s. Check explorer manually.",
    );
    console.log(`TX hash: ${txHash}`);
    process.exit(1);
  }

  if (receipt.excepted) {
    console.error(
      "Transaction failed (excepted=true). Not enough TOL for gas?",
    );
    process.exit(1);
  }

  // newAddress is the deployed contract address in Tolar format
  const contractAddressTolar = receipt.newAddress;

  console.log("\n✅ Contract deployed successfully!");
  console.log("─".repeat(60));
  console.log(`Token name:              ${TOKEN_NAME}`);
  console.log(`Token symbol:            ${TOKEN_SYMBOL}`);
  console.log(
    `Token supply:            ${TOKEN_SUPPLY.toLocaleString()} ${TOKEN_SYMBOL}`,
  );
  console.log(`Contract address:        ${contractAddressTolar}`);
  console.log(`Transaction hash:        ${txHash}`);
  console.log("─".repeat(60));
  console.log(
    "Save the contract address — you will need it to add the token to the wallet.",
  );
}

deploy().catch((err) => {
  console.error("Deploy failed:", err.message ?? err);
  process.exit(1);
});
