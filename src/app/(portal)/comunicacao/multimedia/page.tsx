import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { MediaView } from "./view";

export const metadata = { title: t.media.title };

export default function Page() {
  return <Suspense><Booted><MediaView /></Booted></Suspense>;
}
