// Pure data types for the user-data bundle. No store imports, no business logic.

export interface UserDataSection {
  data: unknown;
  updated_at: string;
}

export interface UserDataBundle {
  type: "voltius-user-data";
  version: 2;
  exported_at: string;
  sections: Record<string, UserDataSection>;
}

export function toUserDataJSON(bundle: UserDataBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function fromUserDataJSON(text: string): UserDataBundle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON");
  }
  const b = parsed as Partial<UserDataBundle>;
  if (b.type !== "voltius-user-data") throw new Error("Not a Voltius user data file");
  if (b.version !== 2) throw new Error(`Unsupported user data version: ${b.version}`);
  return {
    type: "voltius-user-data",
    version: 2,
    exported_at: b.exported_at ?? new Date().toISOString(),
    sections: b.sections && typeof b.sections === "object" ? b.sections : {},
  };
}
