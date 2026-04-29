import { useShortcutStore } from "@/stores/shortcutStore";
import type { UserDataHandler } from "../handler";

interface ShortcutOverride {
  id: string;
  key: string;
  ctrl: boolean;
  shift: boolean;
}

export const shortcutsHandler: UserDataHandler = {
  key: "shortcuts",
  label: "Shortcuts",
  icon: "lucide:keyboard",

  export(): ShortcutOverride[] {
    return useShortcutStore.getState().shortcuts.map(({ id, key, ctrl, shift }) => ({ id, key, ctrl, shift }));
  },

  async import(data: unknown): Promise<void> {
    const overrides = data as ShortcutOverride[];
    const store = useShortcutStore.getState();
    for (const o of (overrides ?? [])) {
      store.setKey(o.id, o.key, o.ctrl, o.shift);
    }
  },

  merge(_local, remote, localTs, remoteTs) {
    if (!_local) return { value: remote, updated: true };
    if (!remote) return { value: _local, updated: false };
    if (remoteTs > localTs) return { value: remote, updated: true };
    return { value: _local, updated: false };
  },

  getTimestamp(): string {
    return useShortcutStore.getState().shortcutsUpdatedAt;
  },

  describe(): string {
    const overrides = useShortcutStore.getState().shortcuts.filter(
      (sc) => sc.key !== sc.defaultKey,
    );
    return overrides.length > 0
      ? `${overrides.length} override${overrides.length !== 1 ? "s" : ""}`
      : "defaults";
  },
};
