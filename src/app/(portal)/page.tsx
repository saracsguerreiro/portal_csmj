import { HomeView } from "@/features/home/HomeView";
import { t } from "@/i18n";

export const metadata = { title: t.home.title };

export default function Home() {
  return <HomeView />;
}
