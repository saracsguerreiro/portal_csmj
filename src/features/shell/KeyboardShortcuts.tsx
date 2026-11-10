"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useShell } from "./ShellContext";

function typing(el: EventTarget | null) {
  const n = el as HTMLElement | null;
  return !!n && (n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.tagName === "SELECT" || n.isContentEditable);
}

export function KeyboardShortcuts({ searchRef }: { searchRef: React.RefObject<HTMLInputElement | null> }) {
  const { open, overlay, close } = useShell();
  const router = useRouter();
  const pending = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (overlay === "palette") close(); else open("palette");
        return;
      }
      if (typing(e.target) || e.ctrlKey || e.metaKey || e.altKey || document.querySelector("dialog[open]")) return;
      if (e.key === "/") {
        e.preventDefault();
        if (searchRef.current && searchRef.current.offsetParent) searchRef.current.focus();
        else open("search");
      } else if (e.key === "?") {
        e.preventDefault();
        open("help");
      } else if (e.key === "g") {
        pending.current = Date.now();
      } else if (e.key === "i" && Date.now() - pending.current < 1200) {
        pending.current = 0;
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, overlay, router, searchRef]);

  return null;
}
