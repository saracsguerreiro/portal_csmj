import { Suspense } from "react";
import { climate } from "@/data/institution";
import { Booted } from "@/features/shell/Booted";
import { ClimateView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: climate.id }];
}

export const metadata = { title: "Inquéritos" };

export default function Page() {
  return <Suspense><Booted><ClimateView /></Booted></Suspense>;
}
