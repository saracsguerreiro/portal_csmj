import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { NewcomersView } from "./view";

export const metadata = { title: t.peoplePage.newTitle };

export default function Page() {
  return <Suspense><Booted><NewcomersView /></Booted></Suspense>;
}
