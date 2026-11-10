import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { NewsView } from "./view";

export const metadata = { title: t.news.title };

export default function Page() {
  return <Suspense><Booted><NewsView /></Booted></Suspense>;
}
