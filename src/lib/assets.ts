/** Caminho de um ficheiro de /public com o prefixo do site (no GitHub Pages: /portal_csmj). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string) {
  return path.startsWith("/") ? `${BASE_PATH}${path}` : path;
}
