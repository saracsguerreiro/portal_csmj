import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { FavoritesView } from "./view";

export const metadata = { title: t.docs.favTitle };

export default function Page() {
  return <Suspense><Booted><FavoritesView /></Booted></Suspense>;
}
