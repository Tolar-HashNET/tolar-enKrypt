import tolGetAccounts from "./tol_getAccounts";
import tolRequestAccounts from "./tol_requestAccounts";
import tolSwitchNetwork from "./tol_switchNetwork";
import tolSendRawTransaction from "./tol_sendRawTransaction";
import tolGetCurrentBalance from "./tol_getCurrentBalance.ts";
import tolSignMessage from "./tol_signMessage.ts";
import tolGetNetwork from "./tol_getNetwork";

export default [
  tolGetAccounts,
  tolRequestAccounts,
  tolSwitchNetwork,
  tolSendRawTransaction,
  tolGetCurrentBalance,
  tolSignMessage,
  tolGetNetwork
];
