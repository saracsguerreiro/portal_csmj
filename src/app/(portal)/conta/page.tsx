import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { AccountView } from "./view";

export const metadata = { title: t.account.title };

export default function Page() {
  return <Suspense><Booted><AccountView /></Booted></Suspense>;
}
