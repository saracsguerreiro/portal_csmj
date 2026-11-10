"use client";

import { MessageCircleQuestion, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Segmented } from "@/design-system";
import { SearchCombobox } from "@/features/shell/SearchCombobox";
import { t } from "@/i18n";

const h = t.home;

let enteredOnce = false;

/** A entrada orquestrada corre uma vez por carregamento; ao voltar ao Início já não se repete. */
export function TodayMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (enteredOnce) ref.current?.classList.remove("hoje-enter");
    enteredOnce = true;
  }, []);
  return <div ref={ref} className="hoje-enter @container grid gap-4 md:grid-cols-12">{children}</div>;
}

export function TodayBox() {
  const router = useRouter();
  const [mode, setMode] = useState<"search" | "ask">("search");
  const seg = (
    <Segmented
      legend={h.modeLegend} value={mode} onChange={setMode}
      options={[
        { value: "search", label: h.modeSearch, icon: <Search size={14} aria-hidden /> },
        { value: "ask", label: h.modeAsk, icon: <MessageCircleQuestion size={14} aria-hidden /> },
      ]}
    />
  );
  const icon = mode === "ask" ? <MessageCircleQuestion size={20} className="text-subtle" aria-hidden /> : <Search size={20} className="text-subtle" aria-hidden />;
  const placeholder = mode === "ask" ? h.askPlaceholder : h.searchPlaceholder;
  const onSubmit = mode === "ask" ? (q: string) => router.push(`/perguntar?q=${encodeURIComponent(q)}`) : undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="@2xl:hidden">{seg}</div>
      <SearchCombobox key={mode} variant="today" placeholder={placeholder} label={placeholder} suggest={mode === "search"} onSubmit={onSubmit} icon={icon} trailing={<span className="hidden @2xl:inline-flex">{seg}</span>} />
    </div>
  );
}
