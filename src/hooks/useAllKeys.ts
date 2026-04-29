import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useKeyStore } from "@/stores/keyStore";
import { useTeamStore } from "@/stores/teamStore";
import type { SshKey } from "@/types";

export function useAllKeys(): SshKey[] {
  const personal = useKeyStore((s) => s.keys);
  const teamMap = useKeyStore((s) => s.teamKeys);
  const teamIds = useTeamStore(useShallow((s) => s.teams.map((t) => t.id)));
  return useMemo(() => {
    const map = new Map<string, SshKey>();
    for (const k of personal) map.set(k.id, k);
    for (const id of teamIds) for (const k of teamMap[id] ?? []) map.set(k.id, k);
    return [...map.values()];
  }, [personal, teamMap, teamIds]);
}
