"use client";

import { useEffect } from "react";
import { bootClient } from "@/lib/client";
import { setPrefs } from "./client-api";

export function ClientBoot() {
  useEffect(() => {
    bootClient();
    /* Só no protótipo: permite aos testes automáticos mudar de perfil sem recarregar. */
    (window as unknown as { __csmjPrefs?: typeof setPrefs }).__csmjPrefs = setPrefs;
  }, []);
  return null;
}
