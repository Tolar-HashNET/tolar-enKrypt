import tolConnectDapp from "../tol-connect-dapp.vue";
import tolSignMessage from "../tol-sign-message.vue";
import { RouteRecordRaw } from "vue-router";
import RouteNames from "./names";
import tolHWVerify from "../send-transaction/verify-transaction/index.vue";

const routes = Object.assign({}, RouteNames);
routes.tolConnectDapp.component = tolConnectDapp;
routes.tolSignMessage.component = tolSignMessage;
routes.tolHWVerify.component = tolHWVerify;

export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
