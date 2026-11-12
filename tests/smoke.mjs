/**
 * Verificação rápida do protótipo no Chrome instalado.
 * Uso: node tests/smoke.mjs   (U=http://localhost:8490 por omissão; para o Pages: U=https://saracsguerreiro.github.io/portal_csmj)
 */
import { chromium } from "playwright-core";
import { readFileSync, mkdirSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const U = process.env.U || "http://localhost:8490";
const OUT = process.env.OUT || "";
if (OUT) mkdirSync(OUT, { recursive: true });
const res = [];
const ok = (n, v, x = "") => res.push(`${v ? "OK   " : "FALHA"} ${n} ${x}`);
const errs = [];

const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => errs.push(`PE ${p.url()} ${e.message.slice(0, 120)}`));
const go = async (u) => { await p.goto(U + u, { waitUntil: "networkidle", timeout: 120000 }); await p.waitForTimeout(400); };
const prefs = async (set, reset = false) => { await p.waitForFunction(() => !!window.__csmjPrefs); await p.evaluate(([s, r]) => window.__csmjPrefs(s, r), [set, reset]); };
const axeRun = async (tag) => {
  await p.evaluate(axe);
  const v = await p.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((x) => `${x.id}:${x.nodes.length}:${x.nodes.slice(0, 2).map((n) => n.target.join(" ")).join("|")}`));
  ok(`axe ${tag}`, v.length === 0, v.join(", "));
};
const toast = async (re) => { try { await p.locator(".toast").filter({ hasText: re }).first().waitFor({ timeout: 3000 }); return true; } catch { return false; } };

await go("/"); await prefs({ csmj_perfil: null, csmj_unidade: null, csmj_falha: null, csmj_tema: null, csmj_bloqueante: null }, true); await go("/");

/* Início */
ok("pendentes com circular no topo", await p.locator('section[aria-label="Pendentes"] section[aria-label="Avisos por confirmar"]').count() === 1);
const search = p.locator(".band-search .search-box");
const sb = await search.evaluate((e) => { const c = getComputedStyle(e); return { h: e.getBoundingClientRect().height, bg: c.backgroundColor, border: c.borderTopColor }; });
ok("pesquisa do topo visível (caixa com fundo e contorno)", sb.h >= 48 && sb.bg !== "rgba(0, 0, 0, 0)", JSON.stringify(sb));
const radius = await p.evaluate(() => [...document.querySelectorAll(".btn, .bdg, .chip, .count, .search-box, .card, .seg")].filter((e) => e.offsetParent).map((e) => getComputedStyle(e).borderTopLeftRadius).filter((r) => r !== "0px"));
ok("botões e etiquetas de cantos rectos", radius.length === 0, radius.slice(0, 5).join(","));
const bday = await p.locator(".bday-box").evaluate((e) => getComputedStyle(e).backgroundColor);
const newbie = await p.locator(".newbie").first().evaluate((e) => getComputedStyle(e).backgroundColor);
ok("aniversários em cinza claro como os novos colegas", bday === newbie, `${bday} / ${newbie}`);
const warn = await p.evaluate(() => { const e = document.querySelector(".bdg-warn"); return e ? getComputedStyle(e).backgroundColor : "sem"; });
ok("etiquetas de aviso sem fundo amarelo", warn === "sem" || warn === "rgb(240, 240, 240)", warn);
await axeRun("início");
if (OUT) await p.screenshot({ path: `${OUT}/inicio-1440.png` });
if (OUT) await p.screenshot({ path: `${OUT}/inicio-1440-completa.png`, fullPage: true });
await p.getByRole("button", { name: "Aprovar" }).first().click(); await p.locator('section[aria-label="Pendentes"] [role=status]').first().waitFor(); await p.locator('section[aria-label="Pendentes"] li button.btn-pri').first().click(); ok("aprovar com desfazer", await toast(/aprovado/i));
await p.locator(".rail").getByRole("link", { name: "Serviços" }).hover(); await p.waitForTimeout(500);
ok("menu abre ao passar o rato", await p.locator(".flyout a.sm-big", { hasText: "Fazer um pedido" }).count() === 1);
await p.mouse.move(1300, 700); await p.waitForTimeout(500);
await p.getByRole("button", { name: "Faz a tua questão" }).click(); await p.waitForTimeout(300);
ok("chat flutuante", await p.locator(".chat-panel").getByText("Faz a tua questão").count() === 1);
await p.keyboard.press("Escape");
await p.keyboard.press("/"); ok("/ foca a pesquisa", await p.evaluate(() => document.activeElement?.getAttribute("role") === "combobox"));

/* Páginas principais: carregam, sem erros e com acessibilidade */
for (const u of ["/comunicacao/noticias", "/comunicacao/eventos", "/comunicacao/avisos", "/servicos", "/servicos/meus-pedidos", "/documentos", "/pessoas", "/participar/enquetes", "/conta"]) {
  await go(u); ok(`abre ${u}`, (await p.locator("main h1").count()) >= 1); await axeRun(u);
}
await go("/comunicacao/noticias"); await p.waitForTimeout(900); ok("mosaico de notícias", await p.locator("li.mosaic-tile.is-in").count() >= 4);
if (OUT) await p.screenshot({ path: `${OUT}/noticias-1440.png` });
ok("grelha: seta em quadrado vermelho, sem «Ver notícia»", await p.locator("li.mosaic-tile .sq-arrow").count() >= 4 && await p.locator("li.mosaic-tile").getByText("Ver notícia").count() === 0);
await go("/comunicacao/noticias/plano-formacao-2027");
ok("notícia em painéis: texto, reacções e comentários separados", await p.locator("main .panel").count() >= 4);
ok("notícia: fim marcado", await p.getByText("Fim da notícia").count() === 1);
ok("notícia: coluna de recentes", await p.locator('section[aria-labelledby="recentes"] li').count() >= 4);
await axeRun("notícia");
await go("/comunicacao/eventos");
ok("eventos: calendário do mês", await p.locator("table.mini-cal td").count() >= 35);
ok("eventos: dias com eventos assinalados", await p.locator(".mini-day.has-ev").count() >= 3);
await p.locator(".mini-day.has-ev", { hasText: "13" }).first().click(); await p.waitForURL(/dia=2026-11-13/);
ok("eventos: escolher um dia filtra a lista", await p.getByRole("heading", { name: /Eventos a 13 de Novembro/ }).count() === 1 && await p.getByText("Jornadas de Direito Penal").count() >= 1);
await axeRun("eventos");
await go("/servicos"); if (OUT) await p.screenshot({ path: `${OUT}/servicos-1440.png` });

/* Painel */
await prefs({ csmj_perfil: "gestor-conteudos" }); await go("/painel/noticias"); ok("painel abre", await p.locator("main h1", { hasText: "Notícias" }).count() === 1); await axeRun("painel");
if (OUT) await p.screenshot({ path: `${OUT}/painel-1440.png` });

/* Escuro */
await prefs({ csmj_tema: "dark", csmj_perfil: null }); await go("/"); await axeRun("início escuro"); await prefs({ csmj_tema: null });

/* Telemóvel */
const m = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const g = await m.newPage(); g.on("pageerror", (e) => errs.push(`PE m ${e.message.slice(0, 120)}`));
for (const u of ["/", "/comunicacao/noticias", "/comunicacao/noticias/plano-formacao-2027", "/comunicacao/eventos", "/servicos", "/documentos", "/pessoas", "/painel/noticias"]) {
  await g.goto(U + u, { waitUntil: "networkidle" }); await g.waitForTimeout(400);
  const o = await g.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  ok(`390 sem deslocamento lateral ${u}`, o[0] <= o[1], o.join("/"));
}
await g.goto(U + "/", { waitUntil: "networkidle" }); if (OUT) await g.screenshot({ path: `${OUT}/inicio-390.png` });

console.log(res.join("\n"));
console.log("ERROS:", errs.length ? [...new Set(errs)].join("\n") : "nenhum");
await b.close();
process.exit(res.some((r) => r.startsWith("FALHA")) || errs.length ? 1 : 0);
