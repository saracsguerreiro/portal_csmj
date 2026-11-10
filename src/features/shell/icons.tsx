import {
  Activity, BarChart3, Building2, LayoutDashboard, ListTree, PanelsTopLeft, Plug, ScrollText, Send, Settings, Tags, Upload, Users, Workflow, MessageSquare, BookOpenText, CalendarDays, CalendarOff, CalendarX, Car, ClipboardList, Contact, DoorOpen, FileBadge, FileText, HeartPulse, Images, Info, KeyRound,
  Landmark, Library, LifeBuoy, Lightbulb, Mail, Megaphone, Network, Newspaper, Package, Palmtree, Scale, SquarePen, Stamp, Star, UserPlus, Vote,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Activity, BarChart3, Building2, LayoutDashboard, ListTree, PanelsTopLeft, Plug, ScrollText, Send, Settings, Tags, Upload, Users, Workflow, MessageSquare, BookOpenText, CalendarDays, CalendarOff, CalendarX, Car, ClipboardList, Contact, DoorOpen, FileBadge, FileText, HeartPulse, Images, Info, KeyRound,
  Landmark, Library, LifeBuoy, Lightbulb, Mail, Megaphone, Network, Newspaper, Package, Palmtree, Scale, SquarePen, Stamp, Star, UserPlus, Vote,
};

export function NamedIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = map[name] ?? FileText;
  return <Icon size={size} aria-hidden />;
}
