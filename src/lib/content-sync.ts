import { events } from "@/data/events";
import { news } from "@/data/news";
import { notices } from "@/data/notices";
import { albums, mediaState, SEED_ALBUM_IDS, videos } from "@/data/media";
import type { Album, VideoItem } from "@/data/types";
import type { AdminEvent, AdminNews, AdminNotice } from "@/data/content";

/** O portal mostra só o que está publicado. Actualiza as listas públicas a partir dos conteúdos do painel. */
const SEED_VIDEO_IDS = new Set(videos.map((v) => v.id));

export function syncPublic(db: { news: AdminNews[]; events: AdminEvent[]; notices: AdminNotice[]; photoMeta?: typeof mediaState.meta; albumOrder?: Record<string, string[]>; extraAlbums?: Album[]; extraVideos?: VideoItem[] }) {
  mediaState.meta = db.photoMeta ?? {};
  mediaState.order = db.albumOrder ?? {};
  const seedAlbums = albums.filter((a) => SEED_ALBUM_IDS.has(a.id));
  albums.splice(0, albums.length, ...(db.extraAlbums ?? []), ...seedAlbums);
  const seedVideos = videos.filter((v) => SEED_VIDEO_IDS.has(v.id));
  videos.splice(0, videos.length, ...(db.extraVideos ?? []), ...seedVideos);
  const strip = <T extends { meta: unknown }>(x: T) => { const { meta: _m, ...rest } = x; void _m; return rest; };
  const pubNews = db.news.filter((n) => n.meta.status === "publicado").sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).map((n) => strip(n));
  news.splice(0, news.length, ...pubNews);
  const pubEvents = db.events.filter((e) => e.meta.status === "publicado").map((e) => { const { registrants: _r, waitlist: _w, pendingRegs: _p, reminder: _x, ...rest } = strip(e); void _r; void _w; void _p; void _x; return rest; });
  events.splice(0, events.length, ...pubEvents);
  const pubNotices = db.notices.filter((n) => n.meta.status === "publicado" && !n.closed).map((n) => { const { confirmedBy: _c, requireConfirm, blockPortal: _b, reminderDays: _rd, escalateDays: _e, endsAt: _en, closed: _cl, ...rest } = strip(n); void _c; void _b; void _rd; void _e; void _en; void _cl; return { ...rest, mandatory: requireConfirm }; });
  notices.splice(0, notices.length, ...pubNotices);
}
