import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { DecisionView } from "./view";

export const metadata = { title: t.approvals.decide };

export default function Page() {
  return <Suspense><Booted><DecisionView /></Booted></Suspense>;
}
