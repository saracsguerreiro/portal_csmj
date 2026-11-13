"use client";

import { Bell, Check, Plus } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  Alert, Avatar, Button, Checkbox, ConfirmDialog, Counter, DateField, DateMark, DateRangeField, EmptyState, FileUpload, IconButton, MultiSelect, PageHeader, PasswordField, PersonPicker,
  Progress, Radio, ScopeTag, Segmented, SelectField, Sheet, Skeleton, StatusBadge, Switch, Tabs, TextArea, TextField, TimeField, ToastProvider, TreeSelect, useToast,
} from "@/design-system";

const STATES: [string, string | undefined][] = [["Normal", undefined], ["Passagem", "hover"], ["Foco", "focus"], ["Activo", "active"]];

function Both({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="flex flex-col gap-3 rounded-[20px] p-4" style={{ background: "var(--ds-background-app)", color: "var(--ds-content-default)" }}>
          <p className="text-caption font-semibold text-subtle">{theme === "light" ? "Tema claro" : "Tema escuro"}</p>
          {children}
        </div>
      ))}
    </div>
  );
}

function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card flex flex-col gap-4">
      <h2 className="text-section font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return <div className="flex flex-col gap-1.5"><span className="text-caption text-subtle">{label}</span><div className="flex flex-wrap items-center gap-2">{children}</div></div>;
}

const people = [{ value: "a", label: "Marta Kiala", detail: "Juíza de Direito" }, { value: "b", label: "Domingos Tchipa", detail: "Juiz Presidente" }, { value: "c", label: "Isabel Ngola", detail: "Oficial de Justiça" }];
const tree = [{ id: "n", label: "Nacional", children: [{ id: "rl", label: "Relação de Luanda", children: [{ id: "b", label: "Comarca de Belas" }, { id: "l", label: "Comarca de Luanda" }] }, { id: "rb", label: "Relação de Benguela", children: [{ id: "be", label: "Comarca de Benguela" }] }] }];
const swatches = [["Grená 700", "#852418"], ["Grená 800", "#6C1D13"], ["Grená 50", "#FCF4F3"], ["Ouro 400", "#E1B229"], ["Preto", "#000000"], ["Cinza 700", "#404040"], ["Cinza 600", "#5C5C5C"], ["Cinza 500", "#737373"], ["Cinza 200", "#E6E6E6"], ["Cinza 100", "#F4F4F4"]];

function Gallery() {
  const { show } = useToast();
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [seg, setSeg] = useState("a");
  const [tab, setTab] = useState("a");
  const [multi, setMulti] = useState(["a"]);
  const [person, setPerson] = useState<string | undefined>();
  const [units, setUnits] = useState(["b"]);
  const [range, setRange] = useState(["2026-12-12", "2026-12-16"]);
  const [sheet, setSheet] = useState(false);
  const [dlg, setDlg] = useState(false);

  return (
    <main id="conteudo" className="wrap flex flex-col gap-6 py-8" data-density={density}>
      <PageHeader title="Design System CSMJ" description="Componentes da intranet com os estados normal, passagem, foco, activo, desactivado, erro e carregamento, em claro e escuro." actions={<Segmented legend="Densidade" value={density} onChange={setDensity} options={[{ value: "comfortable", label: "Confortável" }, { value: "compact", label: "Compacta" }]} />} />

      <Sec title="Cor">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-6">{swatches.map(([n, h]) => <li key={n}><span className="block h-14 rounded-xl border border-line" style={{ background: h }} /><span className="mt-1 block text-label font-medium text-ink">{n}</span><span className="font-mono text-caption">{h}</span></li>)}</ul>
      </Sec>

      <Sec title="Tipografia">
        <div className="flex flex-col gap-2">
          <p className="text-display font-semibold tracking-[-0.02em] text-ink">Boa tarde, Marta.</p>
          <p className="text-page font-bold text-ink">Título de página · 32/40</p>
          <p className="text-section font-bold text-ink">Título de secção · 24/32</p>
          <p className="text-block font-semibold text-ink">Título de bloco · 18/26</p>
          <p className="max-w-[75ch] text-read">Texto de leitura, 18/30. A linha nunca ultrapassa 75 caracteres para a leitura se manter confortável em qualquer ecrã.</p>
          <p className="text-ui">Interface no telemóvel e campos · 16/24</p>
          <p className="text-body">Corpo da interface · 14/20</p>
          <p className="text-label font-semibold text-ink">Rótulo · 13/18</p>
          <p className="text-caption text-subtle">Legenda · 12/16</p>
          <p className="font-mono text-label text-ink">Circular n.º 12/2026 · DM Mono</p>
        </div>
      </Sec>

      <Sec title="Botões">
        <Both>
          {(["pri", "sec", "gh", "dng"] as const).map((v) => (
            <Row key={v} label={{ pri: "Principal", sec: "Secundário", gh: "Discreto", dng: "Perigo" }[v]}>
              {STATES.map(([l, f]) => <Button key={l} variant={v} data-force={f}>{l}</Button>)}
              <Button variant={v} disabled>Desactivado</Button>
              <Button variant={v} loading>A guardar</Button>
            </Row>
          ))}
          <Row label="Tamanhos"><Button variant="pri" size="lg">Grande</Button><Button variant="pri">Médio</Button><Button variant="pri" size="sm" icon={<Plus size={14} aria-hidden />}>Pequeno</Button></Row>
          <Row label="Botão-ícone">{STATES.map(([l, f]) => <IconButton key={l} label={l} data-force={f}><Bell size={20} aria-hidden /></IconButton>)}<IconButton label="Desactivado" disabled><Bell size={20} aria-hidden /></IconButton></Row>
          <Row label="Ligação"><a className="link" href="#">Normal</a><a className="link" data-force="hover" href="#">Passagem</a><a className="link" data-force="focus" href="#">Foco</a></Row>
        </Both>
      </Sec>

      <Sec title="Campos">
        <Both>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField label="Normal" placeholder="Escreva aqui" />
            <TextField label="Passagem" data-force="hover" defaultValue="Valor" />
            <TextField label="Foco" data-force="focus" defaultValue="Valor" />
            <TextField label="Desactivado" disabled defaultValue="Valor" />
            <TextField label="Erro" required error="Escreva um email como nome@exemplo.ao." defaultValue="nome" />
            <TextField label="Carregamento" loading defaultValue="A verificar" hint="Ajuda junto do campo." />
            <PasswordField label="Senha" defaultValue="exemplo" />
            <SelectField label="Selecção" options={[{ value: "1", label: "Comarca de Belas" }, { value: "2", label: "Comarca de Luanda" }]} />
            <DateField label="Data" defaultValue="2026-11-12" />
            <TimeField label="Hora" defaultValue="14:00" />
          </div>
          <TextArea label="Área de texto" defaultValue="Motivo do pedido." />
        </Both>
        <div className="grid gap-4 md:grid-cols-2">
          <DateRangeField label="Intervalo de datas" start={range[0]} end={range[1]} onStart={(v) => setRange([v, range[1]])} onEnd={(v) => setRange([range[0], v])} />
          <MultiSelect label="Multi-selecção com pesquisa" options={people} value={multi} onChange={setMulti} />
          <PersonPicker label="Pesquisa de pessoa" people={people} value={person} onChange={setPerson} />
          <FileUpload label="Envio de ficheiros" hint="PDF, Word ou imagens até 10 MB." />
          <TreeSelect label="Selector em árvore" nodes={tree} value={units} onChange={setUnits} />
        </div>
      </Sec>

      <Sec title="Escolhas">
        <Both>
          <Row label="Caixa de verificação"><Checkbox>Normal</Checkbox><Checkbox data-force="hover">Passagem</Checkbox><Checkbox data-force="focus">Foco</Checkbox><Checkbox defaultChecked>Activo</Checkbox><Checkbox disabled>Desactivado</Checkbox><Checkbox aria-invalid>Erro</Checkbox></Row>
          <Row label="Opção"><Radio name="r" defaultChecked>Escolhida</Radio><Radio name="r">Normal</Radio><Radio disabled>Desactivada</Radio></Row>
          <Row label="Interruptor"><Switch>Normal</Switch><Switch defaultChecked>Activo</Switch><Switch data-force="focus">Foco</Switch><Switch disabled>Desactivado</Switch></Row>
          <Row label="Chips"><button className="chip">Normal</button><button className="chip" data-force="hover">Passagem</button><button className="chip" data-force="focus">Foco</button><button className="chip" aria-pressed="true">Activo</button><button className="chip" disabled>Desactivado</button></Row>
          <Row label="Segmentado"><Segmented legend="Exemplo" value={seg} onChange={setSeg} options={[{ value: "a", label: "Pesquisar" }, { value: "b", label: "Perguntar" }, { value: "c", label: "Desactivado", disabled: true }]} /></Row>
          <Tabs label="Exemplo" value={tab} onChange={setTab} tabs={[{ id: "a", label: "Activo" }, { id: "b", label: "Passagem", force: "hover" }, { id: "c", label: "Foco", force: "focus" }, { id: "d", label: "Desactivado", disabled: true }]} />
        </Both>
      </Sec>

      <Sec title="Estados, âmbito e pessoas">
        <Both>
          <Row label="Etiqueta de estado"><StatusBadge tone="ok">Publicado</StatusBadge><StatusBadge tone="info">Em análise</StatusBadge><StatusBadge tone="warn">Devolvido para correcção</StatusBadge><StatusBadge tone="err">Recusado</StatusBadge><StatusBadge tone="neu">Rascunho</StatusBadge><StatusBadge tone="brand">Novo</StatusBadge></Row>
          <Row label="Para quem"><ScopeTag kind="national">Nacional</ScopeTag><ScopeTag kind="relation">Relação de Benguela</ScopeTag><ScopeTag kind="court">Comarca de Belas</ScopeTag></Row>
          <Row label="Pessoa e contador"><Avatar initials="MK" size="lg" /><Avatar initials="DT" /><Avatar initials="IN" size="sm" /><Counter value={3} label="3 por ler" /><Counter value={12} label="12 por ler" /></Row>
          <Row label="Data tipográfica"><DateMark day={12} month="Nov" /><DateMark day={13} month="Nov" large /></Row>
          <Progress value={72} label="Confirmações" />
        </Both>
      </Sec>

      <Sec title="Feedback">
        <Both>
          <Alert tone="info" title="A IA é uma ferramenta de apoio">A decisão é sempre da pessoa competente.</Alert>
          <Alert tone="ok" title="Pedido enviado">O próximo passo é a chefia directa.</Alert>
          <Alert tone="warn" title="Caduca em breve">Este documento perde validade em 30 dias.</Alert>
          <Alert tone="err" title="Não foi possível enviar">Verifique a ligação e tente outra vez.</Alert>
          <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 !rounded-full" /><div className="flex-1"><Skeleton className="mb-2 h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div>
          <EmptyState icon={<Check size={24} aria-hidden />} title="Ainda não guardou nada">Use a estrela para guardar documentos aqui.</EmptyState>
        </Both>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => show({ message: "Notícia movida para a lixeira", onUndo: () => show({ message: "Notícia reposta" }) })}>Mensagem com Desfazer</Button>
          <Button onClick={() => setDlg(true)}>Diálogo de confirmação</Button>
          <Button onClick={() => setSheet(true)}>Ficha lateral</Button>
        </div>
        <ConfirmDialog open={dlg} onClose={() => setDlg(false)} onConfirm={() => setDlg(false)} title="Enviar a newsletter?" verb="Enviar newsletter">Depois de enviada, não é possível anular o envio.</ConfirmDialog>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="Lei Orgânica dos Tribunais da Jurisdição Comum" status={<StatusBadge tone="ok">Em vigor</StatusBadge>} footer={<Button variant="pri" block onClick={() => setSheet(false)}>Abrir</Button>}>
          <p className="text-ui">A ficha lateral abre sem sair da lista e fecha com Escape.</p>
        </Sheet>
      </Sec>
    </main>
  );
}

export default function DesignSystemPage() {
  return <ToastProvider><Gallery /></ToastProvider>;
}
