import type { Dict } from "./index";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends (...args: never[]) => unknown ? T[K] : DeepPartial<T[K]> };

/** Tradução inglesa em preparação: cada chave em falta usa o texto português. */
export const en: DeepPartial<Dict> = {
  common: { close: "Close", cancel: "Cancel", undo: "Undo", seeAll: "See all", edit: "Edit", done: "Done", tryAgain: "Try again" },
  shell: { skip: "Skip to content", signOut: "Sign out", goToAdmin: "Go to admin panel" },
};
