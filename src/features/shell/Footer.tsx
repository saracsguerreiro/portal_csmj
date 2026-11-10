import Link from "next/link";
import { entity } from "@/config/entity";
import { t } from "@/i18n";

const f = t.footer;

export function Footer() {
  const year = 2026;
  return (
    <footer className="has-bottom-bar mt-12 border-t border-line bg-surface">
      <div className="wrap grid grid-cols-1 gap-8 py-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <img src={entity.logo.onLight} alt={entity.name} width={220} height={60} className="logo-light" style={{ width: 220, height: "auto" }} loading="lazy" />
          <img src={entity.logo.onDark} alt={entity.name} width={220} height={60} className="logo-dark" style={{ width: 220, height: "auto" }} loading="lazy" />
          <address className="mt-4 flex flex-col gap-1 text-body not-italic">
            <span className="sr-only">{f.contacts}</span>
            <span>{entity.contacts.address}</span>
            <a className="link-quiet !font-medium" href={`tel:${entity.contacts.phone.replaceAll(" ", "")}`}>{entity.contacts.phone}</a>
            <a className="link-quiet !font-medium" href={`mailto:${entity.contacts.email}`}>{entity.contacts.email}</a>
          </address>
        </div>
        <div className="grid gap-8 md:col-span-8 md:grid-cols-3 md:gap-6">
        {entity.footer.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-label font-semibold">{col.title}</h2>
            <ul className="mt-2 flex flex-col">
              {col.links.map((l) => <li key={l.href}><Link href={l.href} className="inline-flex min-h-11 items-center py-1 text-body hover:underline md:min-h-8">{l.label}</Link></li>)}
            </ul>
          </nav>
        ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-wrap items-center gap-x-6 gap-y-1 py-3 text-label text-subtle">
          <span>{f.rights(entity.name, year)}</span>
          <Link href="/ajuda/acessibilidade" className="inline-flex min-h-11 items-center hover:underline md:min-h-0">{f.accessibility}</Link>
          <Link href="/ajuda/privacidade" className="inline-flex min-h-11 items-center hover:underline md:min-h-0">{f.privacy}</Link>
          <Link href="/ajuda" className="inline-flex min-h-11 items-center hover:underline md:min-h-0">{f.help}</Link>
        </div>
      </div>
    </footer>
  );
}
