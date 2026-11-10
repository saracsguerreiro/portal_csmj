import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { PollsView } from "./view";

export const metadata = { title: t.pollsPage.title };

export default function Page() {
  return <Suspense><Booted><PollsView /></Booted></Suspense>;
}
