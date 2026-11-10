import { Suspense } from "react";
import { t } from "@/i18n";
import { SignInForm } from "./SignInForm";

export const metadata = { title: t.auth.signInTitle };

export default function SignIn() {
  return <Suspense><SignInForm /></Suspense>;
}
