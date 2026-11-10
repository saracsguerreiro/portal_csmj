import "server-only";
import { cookies } from "next/headers";
import { people } from "@/data/people";
import { profiles } from "@/data/profiles";
import { units } from "@/data/units";
import { COOKIE } from "./cookies";
import type { Permission, Person, Profile, ProfileId, Unit } from "@/data/types";

export type Session = {
  profile: Profile; person: Person; unit: Unit; homeUnitId: string; myUnits: Unit[];
  theme: "light" | "dark" | "auto"; density: "comfortable" | "compact";
  failing: boolean; blockingNotice: boolean;
  can: (p: Permission) => boolean; canUseAdmin: boolean;
};

export { COOKIE };

export async function getSession(): Promise<Session> {
  const c = await cookies();
  const profile = profiles.find((p) => p.id === (c.get(COOKIE.profile)?.value as ProfileId)) ?? profiles[1];
  const person = people.find((p) => p.id === profile.personId)!;
  const unit = units.find((u) => u.id === c.get(COOKIE.unit)?.value) ?? units.find((u) => u.id === person.unitId)!;
  const myUnits = [person.unitId, ...(profile.extraUnits ?? []), unit.id].filter((v, i, a) => a.indexOf(v) === i).map((id) => units.find((u) => u.id === id)!);
  const theme = (c.get(COOKIE.theme)?.value as Session["theme"]) ?? "auto";
  const density = (c.get(COOKIE.density)?.value as Session["density"]) ?? "comfortable";
  return {
    profile, person, unit, homeUnitId: person.unitId, myUnits, theme, density,
    failing: c.get(COOKIE.fail)?.value === "1",
    blockingNotice: c.get(COOKIE.blocking)?.value === "1",
    can: (p) => profile.permissions.includes(p),
    canUseAdmin: profile.permissions.length > 0,
  };
}
