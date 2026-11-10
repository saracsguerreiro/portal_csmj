import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { MediaList } from "@/features/painel/MediaAdmin";
import { t } from "@/i18n";

export const metadata = { title: t.admin.media.title };

export default function Page() {
  return <Suspense><Booted><MediaList /></Booted></Suspense>;
}
