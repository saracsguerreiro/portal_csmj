import { people } from "@/data/people";
import { profiles } from "@/data/profiles";
import { units } from "@/data/units";
import { COOKIE } from "./cookies";
import { getPref } from "./prefs";
import type { Permission, Person, Profile, ProfileId, Unit } from "@/data/types";

export type Session = {
  profile: Profile; person: Person; unit: Unit; homeUnitId: string; myUnits: Unit[];
  theme: "light" | "dark" | "auto"; density: "comfortable" | "compact";
  failing: boolean; blockingNotice: boolean; signedOut: boolean;
  can: (p: Permission) => boolean; canUseAdmin: boolean;
};

export { COOKIE };

/** Sessão activa a partir das preferências do protótipo. Numa API real viria do servidor de identidade. */
export function currentSession(): Session {
  const profile = profiles.find((p) => p.id === (getPref(COOKIE.profile) as ProfileId)) ?? profiles[1];
  const person = people.find((p) => p.id === profile.personId)!;
  const unit = units.find((u) => u.id === getPref(COOKIE.unit)) ?? units.find((u) => u.id === person.unitId)!;
  const myUnits = [person.unitId, ...(profile.extraUnits ?? []), unit.id].filter((v, i, a) => a.indexOf(v) === i).map((id) => units.find((u) => u.id === id)!);
  return {
    profile, person, unit, homeUnitId: person.unitId, myUnits,
    theme: (getPref(COOKIE.theme) as Session["theme"]) ?? "auto",
    density: (getPref(COOKIE.density) as Session["density"]) ?? "comfortable",
    failing: getPref(COOKIE.fail) === "1",
    blockingNotice: getPref(COOKIE.blocking) === "1",
    signedOut: getPref(COOKIE.out) === "1",
    can: (p) => profile.permissions.includes(p),
    canUseAdmin: profile.permissions.length > 0,
  };
}
