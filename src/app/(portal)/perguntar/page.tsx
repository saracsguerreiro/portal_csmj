import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { AskView } from "./view";

export const metadata = { title: t.ask.title };

export default function Page() {
  return <Suspense><Booted><AskView /></Booted></Suspense>;
}
