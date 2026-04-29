import { Icon } from "@iconify/react";
import { useState } from "react";
import { useVaultStore } from "@/stores/vaultStore";
import { useTeamStore } from "@/stores/teamStore";
import { useTeamVaultStateStore } from "@/stores/teamVaultStateStore";
import { onVaultSelect } from "@/services/teamDataManager";
import LogoBadge from "./LogoBadge";
import { useUIStore } from "@/stores/uiStore";
import { useRipple } from "@/hooks/useRipple";
import { SidebarAccountButton } from "./SidebarAccountButton";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { CreateVaultModal } from "@/components/shared/CreateVaultModal";

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export default function VaultSidebar() {
  const vaults = useVaultStore((s) => s.vaults);
  const selectedVaultIds = useVaultStore((s) => s.selectedVaultIds);
  const selectVaultOnly = useVaultStore((s) => s.selectVaultOnly);
  const addVault = useVaultStore((s) => s.addVault);
  const homeView = useUIStore((s) => s.homeView);
  const setHomeView = useUIStore((s) => s.setHomeView);
  const openSettings = useUIStore((s) => s.openSettings);

  const teams = useTeamStore((s) => s.teams);
  const linkedTeamIds = new Set(vaults.map((v) => v.teamId).filter(Boolean));
  const standaloneTeams = teams.filter((t) => !linkedTeamIds.has(t.id));

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleAddVaultClick = () => {
    const { isPro } = useSubscriptionStore.getState();
    if (!isPro && vaults.length >= 1) {
      openSettings("account");
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateVault = (name: string) => {
    const vault = addVault(name);
    selectVaultOnly(vault.id);
    setHomeView(false);
    setShowCreateModal(false);
  };

  return (
    <aside
      className="flex flex-col shrink-0 items-center gap-2.5 overflow-y-auto overflow-x-hidden"
      style={{ width: "4.75rem", background: "var(--t-bg-terminal)" }}
    >
      {/* App icon */}
      <AppIconButton isActive={homeView} onClick={() => setHomeView(true)} />

      <div className="w-7 h-px my-1" style={{ background: "var(--t-border)" }} />

      {/* Local vault buttons */}
      {vaults.map((vault) => {
        const isActive = selectedVaultIds.includes(vault.id) && !homeView;
        return (
          <div key={vault.id} className="relative flex items-center justify-center w-full">
            <VaultButton
              initial={getInitials(vault.name)}
              label={vault.teamId ? `${vault.name} (Cloud vault)` : vault.name}
              isActive={isActive}
              onClick={() => {
                selectVaultOnly(vault.id);
                setHomeView(false);
                if (vault.teamId) onVaultSelect(vault.teamId).catch(() => {});
              }}
            />
            {vault.teamId && <TeamVaultBadge teamId={vault.teamId} />}
          </div>
        );
      })}

      {/* Standalone team vault buttons (invited members who have no linked local vault) */}
      {standaloneTeams.map((team) => {
        const isActive = selectedVaultIds.includes(team.id) && !homeView;
        return (
          <div key={team.id} className="relative flex items-center justify-center w-full">
            <VaultButton
              initial={getInitials(team.name)}
              label={`${team.name} (Cloud vault)`}
              isActive={isActive}
              onClick={() => {
                selectVaultOnly(team.id);
                setHomeView(false);
                onVaultSelect(team.id).catch(() => {});
              }}
            />
            <TeamVaultBadge teamId={team.id} />
          </div>
        );
      })}

      {/* Add vault */}
      <AddVaultButton onClick={handleAddVaultClick} />

      {showCreateModal && (
        <CreateVaultModal
          onConfirm={handleCreateVault}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      <div className="flex-1" />

      {/* Account */}
      <SidebarAccountButton onOpenSettings={(tab) => openSettings(tab)} />

      {/* Settings */}
      <SettingsButton onClick={() => openSettings()} />
    </aside>
  );
}

function TeamVaultBadge({ teamId }: { teamId: string }) {
  const status = useTeamVaultStateStore((s) => s.statusByTeamId[teamId] ?? "idle");

  let icon: string;
  let spin = false;
  let opacity = 1;

  if (status === "loading") {
    icon = "lucide:loader";
    spin = true;
  } else if (status === "offline") {
    icon = "lucide:cloud-off";
    opacity = 0.5;
  } else {
    icon = "lucide:cloud";
  }

  return (
    <span
      className="absolute bottom-0.5 right-0.5 flex items-center justify-center rounded-full pointer-events-none"
      style={{
        width: 14,
        height: 14,
        background: "var(--t-bg-terminal)",
        opacity,
      }}
    >
      <Icon
        icon={icon}
        width={10}
        className={spin ? "animate-spin" : undefined}
        style={{ color: spin ? "var(--t-accent)" : "var(--t-text-dim)" }}
      />
    </span>
  );
}

function ActivePip({ active }: { active: boolean }) {
  return (
    <span
      className="absolute left-0 rounded-r-full"
      style={{
        width: 4,
        height: active ? 40 : 20,
        background: "var(--t-text-primary)",
        transition: "height 150ms ease",
      }}
    />
  );
}

function AppIconButton({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  const { createRipple, rippleEls } = useRipple();
  const [hovered, setHovered] = useState(false);
  const borderRadius = isActive || hovered ? "0.75rem" : "1.375rem";
  return (
    <div
      className="relative flex items-center justify-center w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {(isActive || hovered) && <ActivePip active={isActive} />}
      <button
        onClick={onClick}
        onMouseDown={createRipple}
        title="Home"
        className="relative overflow-hidden"
        style={{ background: "none", border: "none", padding: 0 }}
      >
        {rippleEls}
        <LogoBadge size={11} active={isActive} borderRadius={borderRadius} />
      </button>
    </div>
  );
}

function VaultButton({
  initial,
  label,
  isActive,
  onClick,
}: {
  initial: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const { createRipple, rippleEls } = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative flex items-center justify-center w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {(isActive || hovered) && <ActivePip active={isActive} />}
      <button
        onClick={onClick}
        onMouseDown={createRipple}
        title={label}
        className="flex items-center justify-center text-base font-bold relative overflow-hidden transition-all"
        style={{
          width: 44,
          height: 44,
          background: isActive ? "var(--t-accent)" : "var(--t-bg-elevated)",
          color: isActive ? "#fff" : "var(--t-text-secondary)",
          borderRadius: isActive ? "0.75rem" : "1.375rem",
          transition: "border-radius 200ms, background 200ms",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLButtonElement).style.borderRadius = "0.75rem";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--t-accent)";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLButtonElement).style.borderRadius = "1.375rem";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--t-bg-elevated)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--t-text-secondary)";
          }
        }}
      >
        {rippleEls}
        {initial}
      </button>
    </div>
  );
}

function SettingsButton({ onClick }: { onClick: () => void }) {
  const { createRipple, rippleEls } = useRipple();
  return (
    <button
      onClick={onClick}
      onMouseDown={createRipple}
      title="Settings"
      className="flex items-center justify-center mb-3 relative overflow-hidden transition-all"
      style={{
        width: 44,
        height: 44,
        borderRadius: "1.375rem",
        background: "transparent",
        color: "var(--t-text-dim)",
        transition: "border-radius 200ms, background 200ms, color 200ms",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderRadius = "0.75rem";
        (e.currentTarget as HTMLButtonElement).style.background = "var(--t-bg-elevated)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--t-text-primary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderRadius = "1.375rem";
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--t-text-dim)";
      }}
    >
      {rippleEls}
      <Icon icon="lucide:settings" width={20} />
    </button>
  );
}

function AddVaultButton({ onClick }: { onClick: () => void }) {
  const { createRipple, rippleEls } = useRipple();
  return (
    <button
      onClick={onClick}
      onMouseDown={createRipple}
      title="Add vault"
      className="flex items-center justify-center relative overflow-hidden transition-all"
      style={{
        width: 44,
        height: 44,
        borderRadius: "1.375rem",
        border: "2px dashed var(--t-border)",
        background: "transparent",
        color: "var(--t-text-dim)",
        transition: "border-radius 200ms, background 200ms, color 200ms",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderRadius = "0.75rem";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--t-accent)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--t-accent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderRadius = "1.375rem";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--t-border)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--t-text-dim)";
      }}
    >
      {rippleEls}
      <Icon icon="lucide:plus" width={20} />
    </button>
  );
}
