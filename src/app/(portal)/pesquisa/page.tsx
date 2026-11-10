import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { SearchView } from "./view";

export const metadata = { title: t.searchPage.title };

export default function Page() {
  return <Suspense><Booted><SearchView /></Booted></Suspense>;
}
