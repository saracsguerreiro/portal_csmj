import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { OrgansView } from "./view";

export const metadata = { title: t.organs.title };

export default function Page() {
  return <Suspense><Booted><OrgansView /></Booted></Suspense>;
}
