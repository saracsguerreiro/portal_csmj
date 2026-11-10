"use client";

import { createContext, type RefObject } from "react";

/** A Início desenha a sua própria linha de topo; recebe aqui a referência da pesquisa para o atalho "/". */
export const HomeSearchRef = createContext<RefObject<HTMLInputElement | null> | null>(null);
