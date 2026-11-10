import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { NewsletterView } from "./view";

export const metadata = { title: t.newsletter.title };

export default function Page() {
  return <Suspense><Booted><NewsletterView /></Booted></Suspense>;
}
