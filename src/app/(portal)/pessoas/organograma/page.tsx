import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { OrgView } from "./view";

export const metadata = { title: t.org.title };

export default function Page() {
  return <Suspense><Booted><OrgView /></Booted></Suspense>;
}
