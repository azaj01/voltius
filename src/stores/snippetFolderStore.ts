import { create } from "zustand";
import type { Folder, FolderFormData } from "@/types";
import * as api from "@/services/snippets";
import { scheduleSync } from "@/services/sync";
import { isServerMode } from "@/services/account";

async function triggerTeamSave(teamId: string): Promise<void> {
  const { saveTeamData } = await import("@/services/teamVaultSync");
  saveTeamData(teamId).catch(() => {});
}

function upsert(arr: Folder[], item: Folder): Folder[] {
  const idx = arr.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...arr, item];
  const next = [...arr];
  next[idx] = item;
  return next;
}

function findTeamEntry(
  teamMap: Record<string, Folder[]>,
  id: string,
): { teamId: string; item: Folder } | null {
  for (const [teamId, items] of Object.entries(teamMap)) {
    const item = items.find((x) => x.id === id);
    if (item) return { teamId, item };
  }
  return null;
}

interface SnippetFolderStore {
  folders: Folder[];
  loading: boolean;
  teamSnippetFolders: Record<string, Folder[]>;
  loadFolders: () => Promise<void>;
  setTeamSnippetFolders: (teamId: string, items: Folder[]) => void;
  clearTeamSnippetFolders: (teamId?: string) => void;
  saveFolder: (data: FolderFormData) => Promise<Folder>;
  updateFolder: (id: string, data: FolderFormData) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  moveFolder: (id: string, parentFolderId: string | null) => Promise<void>;
}

export const useSnippetFolderStore = create<SnippetFolderStore>((set, get) => ({
  folders: [],
  loading: false,
  teamSnippetFolders: {},

  loadFolders: async () => {
    set({ loading: true });
    const folders = await api.listSnippetFolders();
    set({ folders, loading: false });
  },

  setTeamSnippetFolders: (teamId, items) =>
    set((s) => ({ teamSnippetFolders: { ...s.teamSnippetFolders, [teamId]: items } })),

  clearTeamSnippetFolders: (teamId) =>
    set((s) => {
      if (teamId === undefined) return { teamSnippetFolders: {} };
      const next = { ...s.teamSnippetFolders };
      delete next[teamId];
      return { teamSnippetFolders: next };
    }),

  saveFolder: async (data) => {
    if (data.vault_id) {
      const { useTeamStore } = await import("@/stores/teamStore");
      if (useTeamStore.getState().teams.some((t) => t.id === data.vault_id)) {
        const now = new Date().toISOString();
        const folder: Folder = {
          id: crypto.randomUUID(),
          name: data.name,
          object_type: data.object_type,
          parent_folder_id: data.parent_folder_id,
          vault_id: data.vault_id,
          created_at: now,
          updated_at: now,
          clocks: { created_at: now, updated_at: now },
        };
        const vaultId = data.vault_id;
        set((s) => ({
          teamSnippetFolders: {
            ...s.teamSnippetFolders,
            [vaultId]: upsert(s.teamSnippetFolders[vaultId] ?? [], folder),
          },
        }));
        void triggerTeamSave(vaultId);
        return folder;
      }
    }

    const folder = await api.createSnippetFolder(data);
    const folders = await api.listSnippetFolders();
    set({ folders });
    isServerMode().then((s) => { if (s) scheduleSync(); });
    return folder;
  },

  updateFolder: async (id, data) => {
    const teamEntry = findTeamEntry(get().teamSnippetFolders, id);
    if (teamEntry) {
      const { teamId, item: prev } = teamEntry;
      const now = new Date().toISOString();
      const updated: Folder = {
        ...prev,
        name: data.name,
        object_type: data.object_type,
        parent_folder_id: data.parent_folder_id,
        vault_id: data.vault_id ?? prev.vault_id,
        updated_at: now,
        clocks: { ...prev.clocks, updated_at: now },
      };
      set((s) => ({
        teamSnippetFolders: {
          ...s.teamSnippetFolders,
          [teamId]: upsert(s.teamSnippetFolders[teamId] ?? [], updated),
        },
      }));
      void triggerTeamSave(teamId);
      return;
    }

    await api.updateSnippetFolder(id, data);
    const folders = await api.listSnippetFolders();
    set({ folders });
    isServerMode().then((s) => { if (s) scheduleSync(); });
  },

  deleteFolder: async (id) => {
    const teamEntry = findTeamEntry(get().teamSnippetFolders, id);
    if (teamEntry) {
      const { teamId } = teamEntry;
      set((s) => ({
        teamSnippetFolders: {
          ...s.teamSnippetFolders,
          [teamId]: (s.teamSnippetFolders[teamId] ?? []).filter((x) => x.id !== id),
        },
      }));
      void triggerTeamSave(teamId);
      return;
    }

    await api.deleteSnippetFolder(id);
    const folders = await api.listSnippetFolders();
    set({ folders });
    isServerMode().then((s) => { if (s) scheduleSync(); });
  },

  moveFolder: async (id, parentFolderId) => {
    const teamEntry = findTeamEntry(get().teamSnippetFolders, id);
    if (teamEntry) {
      const { teamId, item: folder } = teamEntry;
      const now = new Date().toISOString();
      const updated: Folder = {
        ...folder,
        parent_folder_id: parentFolderId ?? undefined,
        updated_at: now,
        clocks: { ...folder.clocks, updated_at: now },
      };
      set((s) => ({
        teamSnippetFolders: {
          ...s.teamSnippetFolders,
          [teamId]: upsert(s.teamSnippetFolders[teamId] ?? [], updated),
        },
      }));
      void triggerTeamSave(teamId);
      return;
    }

    const folder = get().folders.find((f) => f.id === id);
    if (!folder) return;
    await api.updateSnippetFolder(id, {
      name: folder.name,
      object_type: folder.object_type,
      parent_folder_id: parentFolderId ?? undefined,
    });
    const folders = await api.listSnippetFolders();
    set({ folders });
    isServerMode().then((s) => { if (s) scheduleSync(); });
  },
}));
