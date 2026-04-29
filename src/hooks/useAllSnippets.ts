import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useSnippetStore } from "@/stores/snippetStore";
import { useTeamStore } from "@/stores/teamStore";
import type { Snippet } from "@/types";

export function useAllSnippets(): Snippet[] {
  const personal = useSnippetStore((s) => s.snippets);
  const teamMap = useSnippetStore((s) => s.teamSnippets);
  const teamIds = useTeamStore(useShallow((s) => s.teams.map((t) => t.id)));
  return useMemo(() => {
    const map = new Map<string, Snippet>();
    for (const s of personal) map.set(s.id, s);
    for (const id of teamIds) for (const s of teamMap[id] ?? []) map.set(s.id, s);
    return [...map.values()];
  }, [personal, teamMap, teamIds]);
}
