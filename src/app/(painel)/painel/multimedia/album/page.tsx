import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { AlbumEditor } from "@/features/painel/MediaAdmin";
import { t } from "@/i18n";

export const metadata = { title: t.admin.media.title };

export default function Page() {
  return <Suspense><Booted><AlbumEditor /></Booted></Suspense>;
}
