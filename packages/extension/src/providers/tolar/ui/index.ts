import { ProviderName, UIExportOptions } from "@/types/provider";
import getRoutes from "./routes";

const uiexport: UIExportOptions = {
  providerName: ProviderName.tolar,
  routes: getRoutes(ProviderName.tolar),
};

export default uiexport;
