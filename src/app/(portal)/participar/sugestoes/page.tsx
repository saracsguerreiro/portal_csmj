import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { SuggestionsView } from "./view";

export const metadata = { title: t.suggestionsPage.title };

export default function Page() {
  return <Suspense><Booted><SuggestionsView /></Booted></Suspense>;
}
