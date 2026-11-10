import type { ReactNode } from "react";
import { AdminShell } from "@/features/painel/AdminShell";

export default function PainelLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
