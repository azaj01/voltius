import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useFolderStore } from "@/stores/folderStore";
import { useTeamStore } from "@/stores/teamStore";
import type { Folder } from "@/types";

export function useAllFolders(): Folder[] {
  const personal = useFolderStore((s) => s.folders);
  const teamMap = useFolderStore((s) => s.teamFolders);
  const teamIds = useTeamStore(useShallow((s) => s.teams.map((t) => t.id)));
  return useMemo(() => {
    const map = new Map<string, Folder>();
    for (const f of personal) map.set(f.id, f);
    for (const id of teamIds) for (const f of teamMap[id] ?? []) map.set(f.id, f);
    return [...map.values()];
  }, [personal, teamMap, teamIds]);
}
