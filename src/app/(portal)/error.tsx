"use client";

import { ErrorPage } from "@/features/erros/ErrorPage";

export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorPage kind="geral" code={error.digest ? `CSMJ-${error.digest.slice(0, 8)}` : "CSMJ-500"} onRetry={reset} />;
}
