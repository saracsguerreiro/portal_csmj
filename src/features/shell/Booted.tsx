"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/design-system";
import { useVersion } from "@/lib/client";

/** Mostra o esqueleto da página até o browser carregar as preferências e os dados guardados.
 *  Assim o HTML estático e a primeira pintura no browser são iguais (sem erros de hidratação). */
export function Booted({ children }: { children: ReactNode }) {
  const v = useVersion();
  if (v === 0) {
    return (
      <div className="wrap flex flex-col gap-4 py-8" role="status" aria-label="A carregar">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="mt-4 h-40 w-full !rounded-[24px]" />
        <Skeleton className="h-40 w-full !rounded-[24px]" />
      </div>
    );
  }
  return <>{children}</>;
}
