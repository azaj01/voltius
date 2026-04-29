import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAppSettingsTimestampStore } from "./appSettingsTimestampStore";

interface SftpSettingsStore {
  autoRefreshEnabled: boolean;
  autoRefreshIntervalMs: number;
  tarTransferEnabled: boolean;
  setAutoRefreshEnabled: (v: boolean) => void;
  setAutoRefreshIntervalMs: (v: number) => void;
  setTarTransferEnabled: (v: boolean) => void;
}

export const useSftpSettingsStore = create<SftpSettingsStore>()(
  persist(
    (set) => ({
      autoRefreshEnabled: true,
      autoRefreshIntervalMs: 2000,
      tarTransferEnabled: true,
      setAutoRefreshEnabled: (v) => { set({ autoRefreshEnabled: v }); useAppSettingsTimestampStore.getState().touch(); },
      setAutoRefreshIntervalMs: (v) => { set({ autoRefreshIntervalMs: v }); useAppSettingsTimestampStore.getState().touch(); },
      setTarTransferEnabled: (v) => { set({ tarTransferEnabled: v }); useAppSettingsTimestampStore.getState().touch(); },
    }),
    { name: "voltius-sftp-settings" },
  ),
);
