import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { ContactsView } from "./view";

export const metadata = { title: t.peoplePage.title };

export default function Page() {
  return <Suspense><Booted><ContactsView /></Booted></Suspense>;
}
