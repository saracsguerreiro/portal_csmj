import type { MenuSection, NotificationKind } from "@/data/types";

export type NoticeView = { id: string; title: string; number?: string; body: string[]; version: number; publishedLabel: string; scopeLabel: string; scopeKind: "national" | "relation" | "court" | "unit" };
export type NotificationView = { id: string; kind: NotificationKind; text: string; atLabel: string; href: string; mention?: boolean; read: boolean };
export type HighlightView = { label: string; title: string; detail?: string; href: string } | undefined;
export type PaletteEntry = { id: string; label: string; detail?: string; href: string; group: "goto" | "actions" };
export type Option = { value: string; label: string };

export type ShellData = {
  person: { name: string; initials: string; role: string };
  unit: Option;
  myUnits: Option[];
  sections: MenuSection[];
  highlight: Record<string, HighlightView>;
  notifications: NotificationView[];
  pendingNotices: NoticeView[];
  canUseAdmin: boolean;
  theme: "light" | "dark" | "auto";
  density: "comfortable" | "compact";
  blockingNotice: boolean;
  failing: boolean;
  profileId: string;
  profiles: Option[];
  units: Option[];
  palette: PaletteEntry[];
};
