import { adminNav } from "@/data/admin-nav";
import { AdminPlaceholder } from "@/features/painel/AdminShell";
import { t } from "@/i18n";

export const dynamicParams = false;

const later = adminNav.flatMap((g) => g.items).filter((i) => i.phase && i.phase > 5);
const extra = [{ href: "/painel/paginas/inicio/editar", id: "paginas", phase: 6 }];

export function generateStaticParams() {
  return [...later, ...extra].map((i) => ({ resto: i.href.replace("/painel/", "").split("/") }));
}

export default async function Page({ params }: { params: Promise<{ resto: string[] }> }) {
  const { resto } = await params;
  const href = `/painel/${resto.join("/")}`;
  const item = [...later, ...extra].find((i) => i.href === href);
  return <AdminPlaceholder phase={item?.phase ?? 6} title={item ? t.admin.items[item.id as keyof typeof t.admin.items] : resto.at(-1) ?? ""} />;
}
