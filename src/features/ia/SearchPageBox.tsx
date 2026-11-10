"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { t } from "@/i18n";

export function SearchPageBox({ q }: { q: string }) {
  const router = useRouter();
  const [value, setValue] = useState(q);
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); if (value.trim()) router.push(`/pesquisa?q=${encodeURIComponent(value.trim())}`); }}>
      <div className="today-box">
        <Search size={20} className="text-subtle" aria-hidden />
        <label htmlFor="pesquisa-q" className="sr-only">{t.searchPage.label}</label>
        <input id="pesquisa-q" type="search" value={value} onChange={(e) => setValue(e.target.value)} placeholder={t.searchPage.label} autoFocus={!q} />
        <button type="submit" className="btn btn-pri btn-sm">{t.searchPage.submit}</button>
      </div>
    </form>
  );
}
