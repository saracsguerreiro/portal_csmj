import { NextResponse, type NextRequest } from "next/server";

/** No protótipo a sessão está aberta por omissão; depois de "Sair" pede-se a entrada. */
export function proxy(req: NextRequest) {
  if (req.cookies.get("csmj_saiu")?.value !== "1") return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/entrar";
  url.search = `?volta=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!entrar|recuperar|activar|design-system|api|_next|brand|covers|icon).*)"] };
