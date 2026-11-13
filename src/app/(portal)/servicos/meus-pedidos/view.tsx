"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/design-system";

/** «Os meus pedidos» passou a fazer parte da página Pedidos: leva para lá, mantendo o separador e o pedido aberto. */
export function MyRequestsView() {
  const router = useRouter();
  useEffect(() => { router.replace(`/servicos${window.location.search}`); }, [router]);
  return <div className="wrap py-8"><Skeleton className="h-40 w-full" /></div>;
}
