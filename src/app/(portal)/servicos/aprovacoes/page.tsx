import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { ApprovalsView } from "./view";

export const metadata = { title: t.approvals.title };

export default function Page() {
  return <Suspense><Booted><ApprovalsView /></Booted></Suspense>;
}
