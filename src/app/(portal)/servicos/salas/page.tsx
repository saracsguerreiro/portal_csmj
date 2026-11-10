import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { RoomsView } from "./view";

export const metadata = { title: t.rooms.title };

export default function Page() {
  return <Suspense><Booted><RoomsView /></Booted></Suspense>;
}
