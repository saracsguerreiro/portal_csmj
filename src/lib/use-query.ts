"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

/** Filtros e separadores do URL, como objecto simples. */
export function useQuery(): Record<string, string | undefined> {
  const sp = useSearchParams();
  return useMemo(() => Object.fromEntries(sp.entries()), [sp]);
}
