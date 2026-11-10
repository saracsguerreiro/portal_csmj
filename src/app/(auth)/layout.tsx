import type { ReactNode } from "react";
import { entity } from "@/config/entity";
import { t } from "@/i18n";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <div className="on-brand pattern-brand relative hidden flex-col justify-between p-12 md:flex">
        <img src={entity.logo.onBrand} alt={entity.name} width={360} height={98} style={{ width: 360, height: "auto" }} />
        <p className="max-w-[28ch] text-section font-semibold tracking-[-0.01em]">{t.auth.tagline}</p>
        <span className="filete absolute inset-x-0 bottom-0" />
      </div>
      <main id="conteudo" className="flex flex-col items-center justify-center bg-surface px-4 py-8 md:p-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 md:hidden">
            <img src={entity.logo.onLight} alt={entity.name} width={220} height={60} className="logo-light" style={{ width: 220, height: "auto" }} />
            <img src={entity.logo.onDark} alt={entity.name} width={220} height={60} className="logo-dark" style={{ width: 220, height: "auto" }} />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
