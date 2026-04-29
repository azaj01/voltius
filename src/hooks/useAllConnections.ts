import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useConnectionStore } from "@/stores/connectionStore";
import { useTeamStore } from "@/stores/teamStore";
import type { Connection } from "@/types";

/**
 * Returns personal connections + all in-memory team connections combined.
 * Components that display mixed personal + team data should use this instead
 * of reading `connections` from the store directly.
 */
export function useAllConnections(): Connection[] {
  const personal = useConnectionStore((s) => s.connections);
  const teamMap = useConnectionStore((s) => s.teamConnections);
  const teamIds = useTeamStore(useShallow((s) => s.teams.map((t) => t.id)));
  return useMemo(() => {
    const map = new Map<string, Connection>();
    for (const c of personal) map.set(c.id, c);
    for (const id of teamIds) for (const c of teamMap[id] ?? []) map.set(c.id, c);
    return [...map.values()];
  }, [personal, teamMap, teamIds]);
}
