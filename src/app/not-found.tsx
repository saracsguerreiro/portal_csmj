import { PortalShell } from "@/features/shell/PortalShell";
import { ErrorPage } from "@/features/erros/ErrorPage";

export default function NotFound() {
  return <PortalShell><ErrorPage kind="404" /></PortalShell>;
}
