import type { PluginAPI, PluginManifest, PluginRegisterFn } from "@/plugins/api";
import { ProcessPanel } from "./components/ProcessPanel";

export const manifest: PluginManifest = {
  id: "plugin-process-manager",
  name: "Process Manager",
  version: "1.0.0",
  description: "Monitor and manage running processes for local and SSH sessions.",
  permissions: ["sessions:read", "right-panel"],
  defaultEnabled: true,
};

export const register: PluginRegisterFn = (api: PluginAPI) => {
  return api.ui.registerRightPanelSection({
    id: "processes",
    label: "Processes",
    icon: "lucide:cpu",
    component: ProcessPanel,
  });
};
