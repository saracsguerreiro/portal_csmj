import Link from "next/link";
import { entity } from "@/config/entity";
import { t } from "@/i18n";

const f = t.footer;

/** Rodapé preto: contactos, sistemas, parceiros e apoio. */
export function Footer() {
  const year = 2026;
  return (
    <footer className="site-footer">
      <div className="wrap grid grid-cols-1 gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entity.logo.onDark} alt={entity.name} width={220} height={60} style={{ width: 220, height: "auto" }} loading="lazy" />
          <address className="mt-5 flex flex-col gap-1 text-body not-italic">
            <span className="sr-only">{f.contacts}</span>
            <span>{entity.contacts.address}</span>
            <a className="footer-link !font-medium" href={`tel:${entity.contacts.phone.replaceAll(" ", "")}`}>{entity.contacts.phone}</a>
            <a className="footer-link !font-medium" href={`mailto:${entity.contacts.email}`}>{entity.contacts.email}</a>
          </address>
        </div>
        <div className="grid gap-8 md:col-span-8 md:grid-cols-3 md:gap-6">
          {entity.footer.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="eyebrow !text-[var(--ds-accent-gold)]">{col.title}</h2>
              <ul className="mt-3 flex flex-col">
                {col.links.map((l) => <li key={l.href}><Link href={l.href} className="footer-link inline-flex min-h-11 items-center py-1 text-body md:min-h-8">{l.label}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="wrap flex flex-wrap items-center gap-x-6 gap-y-1 py-4 text-label text-white/70">
          <span>{f.rights(entity.name, year)}</span>
          <Link href="/ajuda/acessibilidade" className="footer-link inline-flex min-h-11 items-center md:min-h-0">{f.accessibility}</Link>
          <Link href="/ajuda/privacidade" className="footer-link inline-flex min-h-11 items-center md:min-h-0">{f.privacy}</Link>
          <Link href="/ajuda" className="footer-link inline-flex min-h-11 items-center md:min-h-0">{f.help}</Link>
        </div>
      </div>
    </footer>
  );
}
