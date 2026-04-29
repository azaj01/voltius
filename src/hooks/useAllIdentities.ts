import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useIdentityStore } from "@/stores/identityStore";
import { useTeamStore } from "@/stores/teamStore";
import type { Identity } from "@/types";

export function useAllIdentities(): Identity[] {
  const personal = useIdentityStore((s) => s.identities);
  const teamMap = useIdentityStore((s) => s.teamIdentities);
  const teamIds = useTeamStore(useShallow((s) => s.teams.map((t) => t.id)));
  return useMemo(() => {
    const map = new Map<string, Identity>();
    for (const i of personal) map.set(i.id, i);
    for (const id of teamIds) for (const i of teamMap[id] ?? []) map.set(i.id, i);
    return [...map.values()];
  }, [personal, teamMap, teamIds]);
}
