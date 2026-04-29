import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { invoke } from "@tauri-apps/api/core";
import { ToolbarViewControls, type LayoutMode, type SortMode } from "@/components/shared/ToolbarViewControls";
import { ToolbarDropdown } from "@/components/shared/ToolbarDropdown";
import { useToolbarResize } from "@/hooks/useToolbarResize";
import { useRipple } from "@/hooks/useRipple";
import { useTerminalSettingsStore } from "@/stores/terminalSettingsStore";
import { useUIContributions } from "@/hooks/useUIContributions";

interface ShellOption {
  name: string;
  path: string;
}

interface HomeToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateHost: () => void;
  onCreateFolder: () => void;
  canCreate?: boolean;
  canCreateFolder?: boolean;
  onOpenLocalTerminal: () => void;
  onOpenSerial: () => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (value: LayoutMode) => void;
  sortMode: SortMode;
  onSortModeChange: (value: SortMode) => void;
  availableTags?: string[];
  tagCounts?: Record<string, number>;
  tagFilter?: string[];
  onTagFilterChange?: (tags: string[]) => void;
  onRenameTag?: (oldName: string, newName: string) => Promise<void>;
  onDeleteTag?: (name: string) => Promise<void>;
}

export function HomeToolbar({
  search,
  onSearchChange,
  onCreateHost,
  onCreateFolder,
  onOpenLocalTerminal,
  onOpenSerial,
  canCreate = true,
  canCreateFolder = true,
  layoutMode,
  onLayoutModeChange,
  sortMode,
  onSortModeChange,
  availableTags,
  tagCounts,
  tagFilter,
  onTagFilterChange,
  onRenameTag,
  onDeleteTag,
}: HomeToolbarProps) {
  const { compact, rowRef, leftRef, rightRef } = useToolbarResize();
  const { createRipple: rippleSerial, rippleEls: ripplesSerial } = useRipple();
  const pluginHostMenuItems = useUIContributions("home.toolbar.hostMenu");

  const newHostItems = [
    ...(canCreateFolder ? [{ label: "New Folder", icon: "lucide:folder-plus", onClick: onCreateFolder }] : []),
    ...pluginHostMenuItems,
  ];

  const [shells, setShells] = useState<ShellOption[]>([]);
  const { preferredShell, setPreferredShell } = useTerminalSettingsStore();

  useEffect(() => {
    invoke<ShellOption[]>("local_list_shells").then(setShells).catch(() => {});
  }, []);

  return (
    <>
      <div ref={rowRef} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--t-bg-sidebar)] border-b border-b-[var(--t-bg-terminal)]">
        <div ref={leftRef} className="flex items-center gap-2 shrink-0">
          <ToolbarDropdown
            icon="lucide:server"
            label={compact ? undefined : "NEW HOST"}
            onAction={onCreateHost}
            items={newHostItems}
            align="left"
            disabled={!canCreate}
            menuWidth={202}
          />

          <ToolbarDropdown
            icon="lucide:terminal"
            label={compact ? undefined : "TERMINAL"}
            value={preferredShell ?? shells[0]?.path ?? ""}
            options={shells.map((s) => ({ value: s.path, label: s.name }))}
            menuWidth={200}
            align="left"
            onAction={onOpenLocalTerminal}
            onChange={setPreferredShell}
          />

          <button
            className="flex items-center gap-2 px-3 py-2 h-8 rounded-lg text-sm font-bold tracking-wider transition-colors shrink-0 whitespace-nowrap bg-[var(--t-bg-input)] text-[var(--t-text-primary)] border border-[var(--t-border-hover)] relative overflow-hidden"
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--t-bg-input-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--t-bg-input)")}
            onMouseDown={rippleSerial}
            onClick={onOpenSerial}
            title="Open serial console"
            type="button"
          >
            {ripplesSerial}
            <Icon icon="lucide:ethernet-port" width={20} />
            {!compact && "SERIAL"}
          </button>
        </div>

        <div ref={rightRef} className="ml-auto flex">
          <ToolbarViewControls
            search={search}
            onSearchChange={onSearchChange}
            filterPlaceholder="Filter hosts..."
            filterWidth={176}
            layoutMode={layoutMode}
            onLayoutModeChange={onLayoutModeChange}
            sortMode={sortMode}
            onSortModeChange={onSortModeChange}
            availableTags={availableTags}
            tagCounts={tagCounts}
            tagFilter={tagFilter}
            onTagFilterChange={onTagFilterChange}
            onRenameTag={onRenameTag}
            onDeleteTag={onDeleteTag}
          />
        </div>
      </div>
    </>
  );
}
