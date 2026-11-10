import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { NewsletterAdmin } from "@/features/painel/NewsletterAdmin";
import { t } from "@/i18n";

export const metadata = { title: t.admin.newsletter.title };

export default function Page() {
  return <Suspense><Booted><NewsletterAdmin /></Booted></Suspense>;
}
