import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

type Variant = "pri" | "sec" | "gh" | "dng" | "on-brand";
type Size = "sm" | "md" | "lg";

function classes(variant: Variant, size: Size, block?: boolean, extra?: string) {
  return ["btn", `btn-${variant}`, size !== "md" && `btn-${size}`, block && "btn-block", extra].filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  "data-force"?: string;
};

export function Button({ variant = "sec", size = "md", block, loading, icon, children, className, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button {...rest} type={type} className={classes(variant, size, block, className)} disabled={disabled || loading} data-loading={loading || undefined} aria-busy={loading || undefined}>
      {loading ? <LoaderCircle size={16} className="spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; block?: boolean; icon?: ReactNode };

export function ButtonLink({ variant = "sec", size = "md", block, icon, children, className, ...rest }: ButtonLinkProps) {
  return (
    <Link {...rest} className={classes(variant, size, block, className)}>
      {icon}
      {children}
    </Link>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: "sm" | "md"; "data-force"?: string };

/** Botão só com ícone: tem sempre nome acessível e dica. */
export function IconButton({ label, size = "md", children, className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button {...rest} type={type} aria-label={label} title={label} className={["icbtn", size === "sm" && "icbtn-sm", className].filter(Boolean).join(" ")}>
      {children}
    </button>
  );
}
