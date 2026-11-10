import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight, Circle, CircleAlert, CircleCheck, CircleDashed, Info, Landmark, MapPin, TriangleAlert, Check, Globe2 } from "lucide-react";
import type { ReactNode } from "react";
import { t } from "@/i18n";

export type Tone = "ok" | "warn" | "err" | "info" | "neu" | "brand";

const toneIcon = { ok: Check, warn: TriangleAlert, err: CircleAlert, info: Circle, neu: CircleDashed, brand: Circle } as const;

/** Etiqueta de estado: sempre ícone e texto. */
export function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const Icon = toneIcon[tone];
  return (
    <span className={`bdg bdg-${tone}`}>
      <Icon size={12} aria-hidden />
      {children}
    </span>
  );
}

export type ScopeKind = "national" | "relation" | "court" | "unit";

const scopeIcon = { national: Landmark, relation: Building2, court: MapPin, unit: Globe2 } as const;

/** Etiqueta "para quem": neutra, para não competir com os estados. */
export function ScopeTag({ kind, children }: { kind: ScopeKind; children: ReactNode }) {
  const Icon = scopeIcon[kind];
  return (
    <span className="scope">
      <Icon size={14} aria-hidden />
      {children}
    </span>
  );
}

export function Avatar({ initials, size = "md", label }: { initials: string; size?: "sm" | "md" | "lg"; label?: string }) {
  return (
    <span className={["avatar", size !== "md" && `avatar-${size}`].filter(Boolean).join(" ")} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {initials}
    </span>
  );
}

export function Counter({ value, label }: { value: number; label: string }) {
  return <span className="count" aria-label={label}>{value > 9 ? "9+" : value}</span>;
}

/** Data como elemento tipográfico. */
export function DateMark({ day, month, large }: { day: number | string; month: string; large?: boolean }) {
  return (
    <span className={["dm", large && "dm-lg"].filter(Boolean).join(" ")}>
      <span className="dm-day">{day}</span>
      <span className="dm-mon">{month}</span>
    </span>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-label">
        <span>{label}</span>
        <b className="text-ink">{value} %</b>
      </div>
      <div className="prog-trk" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="prog-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

const alertIcon = { ok: CircleCheck, warn: TriangleAlert, err: CircleAlert, info: Info } as const;

export function Alert({ tone, title, children }: { tone: keyof typeof alertIcon; title?: string; children?: ReactNode }) {
  const Icon = alertIcon[tone];
  return (
    <div className={`alert alert-${tone}`} role={tone === "err" ? "alert" : undefined}>
      <Icon size={20} aria-hidden />
      <div>
        {title && <b>{title}</b>}
        {children}
      </div>
    </div>
  );
}

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden className={["skel", className].filter(Boolean).join(" ")} style={style} />;
}

export function EmptyState({ icon, title, children, plain }: { icon?: ReactNode; title: string; children?: ReactNode; plain?: boolean }) {
  return (
    <div className={["empty", plain && "empty-plain"].filter(Boolean).join(" ")}>
      {icon && <span className="text-subtle">{icon}</span>}
      <p className="text-ui font-semibold text-ink">{title}</p>
      {children && <div className="text-body">{children}</div>}
    </div>
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="crumbs">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} aria-hidden />}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Cabeçalho de página: o mesmo em toda a plataforma. */
export function LoadError({ what, children }: { what: string; children?: ReactNode }) {
  return (
    <div className="card block-err" role="alert">
      <CircleAlert size={20} aria-hidden className="flex-none" />
      <p>{t.lists.loadError(what)} {children}</p>
    </div>
  );
}

export function PageHeader({ crumbs, crumbsLabel, title, description, actions, children }: { crumbs?: Crumb[]; crumbsLabel?: string; title: string; description?: string; actions?: ReactNode; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-3">
      {crumbs && <Breadcrumbs items={crumbs} label={crumbsLabel ?? t.shell.crumbs} />}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-page font-bold tracking-[-0.02em]">{title}</h1>
          {description && <p className="mt-1 max-w-[75ch] text-ui">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}

/** Cabeçalho de bloco: título e "Ver" quando aplicável. */
export function BlockHeader({ id, title, count, countLabel, action }: { id?: string; title: string; count?: number; countLabel?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-3">
      <h2 id={id} className="text-block font-semibold flex items-center gap-2">
        {title}
        {count !== undefined && count > 0 && <span className="count" aria-label={countLabel}>{count}</span>}
      </h2>
      {action}
    </div>
  );
}

export function Pagination({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages < 2) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label={t.lists.pagination}>
      <ul className="flex items-center justify-center gap-1">
        <li>{page > 1 ? <Link className="page" href={href(page - 1)} aria-label={t.lists.previous}><ChevronLeft size={18} aria-hidden /></Link> : <span className="page" aria-disabled="true"><ChevronLeft size={18} aria-hidden /></span>}</li>
        {nums.map((n, i) => (
          <li key={n} className="flex items-center gap-1">
            {i > 0 && n - nums[i - 1] > 1 && <span aria-hidden className="px-1">…</span>}
            <Link className="page" href={href(n)} aria-label={t.lists.pageN(n)} aria-current={n === page ? "page" : undefined}>{n}</Link>
          </li>
        ))}
        <li>{page < pages ? <Link className="page" href={href(page + 1)} aria-label={t.lists.next}><ChevronRight size={18} aria-hidden /></Link> : <span className="page" aria-disabled="true"><ChevronRight size={18} aria-hidden /></span>}</li>
      </ul>
    </nav>
  );
}

