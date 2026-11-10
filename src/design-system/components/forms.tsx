"use client";

import { ChevronDown, ChevronRight, CircleAlert, Eye, EyeOff, LoaderCircle, Paperclip, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { t } from "@/i18n";
import { IconButton } from "./Button";

const f = t.forms;

/* Campo: rótulo visível, ajuda e erro associados ao controlo */
type FieldShell = { label: string; hint?: string; error?: string; required?: boolean; className?: string };

function useFieldIds(idProp?: string) {
  const auto = useId();
  const id = idProp ?? auto;
  return { id, hintId: `${id}-hint`, errId: `${id}-err` };
}

function Described({ hint, error, hintId, errId }: { hint?: string; error?: string; hintId: string; errId: string }) {
  return (
    <>
      {hint && <span id={hintId} className="field-hint">{hint}</span>}
      {error && (
        <span id={errId} className="field-err">
          <CircleAlert size={14} aria-hidden style={{ flex: "none", marginTop: 1 }} />
          {error}
        </span>
      )}
    </>
  );
}

function describedBy(hint: string | undefined, error: string | undefined, hintId: string, errId: string) {
  return [hint && hintId, error && errId].filter(Boolean).join(" ") || undefined;
}

function Label({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="field-label">
      {label}
      {required && <span className="field-req" aria-hidden>*</span>}
    </label>
  );
}

type TextFieldProps = FieldShell & Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & { loading?: boolean; "data-force"?: string };

export function TextField({ label, hint, error, required, className, id: idProp, loading, ...rest }: TextFieldProps) {
  const { id, hintId, errId } = useFieldIds(idProp);
  return (
    <div className={["field", className].filter(Boolean).join(" ")}>
      <Label htmlFor={id} label={label} required={required} />
      <span className="inp-wrap">
        <input {...rest} id={id} required={required} className="inp" aria-invalid={error ? true : undefined} aria-describedby={describedBy(hint, error, hintId, errId)} aria-busy={loading || undefined} />
        {loading && <LoaderCircle size={16} className="spin inp-loading" aria-hidden />}
      </span>
      <Described {...{ hint, error, hintId, errId }} />
    </div>
  );
}

export function PasswordField({ label, hint, error, required, className, id: idProp, ...rest }: TextFieldProps) {
  const { id, hintId, errId } = useFieldIds(idProp);
  const [show, setShow] = useState(false);
  return (
    <div className={["field", className].filter(Boolean).join(" ")}>
      <Label htmlFor={id} label={label} required={required} />
      <span className="inp-wrap">
        <input {...rest} id={id} type={show ? "text" : "password"} required={required} className="inp" style={{ paddingRight: 52 }} aria-invalid={error ? true : undefined} aria-describedby={describedBy(hint, error, hintId, errId)} />
        <span className="inp-suffix">
          <IconButton label={show ? f.hidePassword : f.showPassword} onClick={() => setShow((s) => !s)} aria-pressed={show}>
            {show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </IconButton>
        </span>
      </span>
      <Described {...{ hint, error, hintId, errId }} />
    </div>
  );
}

type TextAreaProps = FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement> & { "data-force"?: string };

export function TextArea({ label, hint, error, required, className, id: idProp, ...rest }: TextAreaProps) {
  const { id, hintId, errId } = useFieldIds(idProp);
  return (
    <div className={["field", className].filter(Boolean).join(" ")}>
      <Label htmlFor={id} label={label} required={required} />
      <textarea {...rest} id={id} required={required} className="inp" aria-invalid={error ? true : undefined} aria-describedby={describedBy(hint, error, hintId, errId)} />
      <Described {...{ hint, error, hintId, errId }} />
    </div>
  );
}

type SelectProps = FieldShell & SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[]; "data-force"?: string };

export function SelectField({ label, hint, error, required, className, id: idProp, options, ...rest }: SelectProps) {
  const { id, hintId, errId } = useFieldIds(idProp);
  return (
    <div className={["field", className].filter(Boolean).join(" ")}>
      <Label htmlFor={id} label={label} required={required} />
      <span className="inp-wrap">
        <select {...rest} id={id} required={required} className="inp" aria-invalid={error ? true : undefined} aria-describedby={describedBy(hint, error, hintId, errId)}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={16} className="inp-chevron" aria-hidden />
      </span>
      <Described {...{ hint, error, hintId, errId }} />
    </div>
  );
}

/* Data, hora e intervalo: controlos nativos, adaptados ao telemóvel */
export function DateField(props: TextFieldProps) {
  return <TextField type="date" {...props} />;
}

export function TimeField(props: TextFieldProps) {
  return <TextField type="time" {...props} />;
}

export function DateRangeField({ label, start, end, onStart, onEnd, error, hint, id, required }: { label: string; start: string; end: string; onStart: (v: string) => void; onEnd: (v: string) => void; error?: string; hint?: string; id?: string; required?: boolean }) {
  const hintId = useId();
  const errId = useId();
  const invalid = error ?? (start && end && end < start ? f.rangeInvalid : undefined);
  return (
    <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={describedBy(hint, invalid, hintId, errId)}>
      <legend className="field-label" style={{ padding: 0, marginBottom: 6 }}>{label}{required && <span className="field-req" aria-hidden>*</span>}</legend>
      <div className="grid grid-cols-2 gap-2">
        <input id={id} className="inp" type="date" aria-label={f.rangeStart} value={start} onChange={(e) => onStart(e.target.value)} />
        <input className="inp" type="date" aria-label={f.rangeEnd} value={end} min={start || undefined} onChange={(e) => onEnd(e.target.value)} aria-invalid={invalid ? true : undefined} />
      </div>
      <Described hint={hint} error={invalid} hintId={hintId} errId={errId} />
    </fieldset>
  );
}

type CheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { children: ReactNode; "data-force"?: string };

export function Checkbox({ children, ...rest }: CheckProps) {
  return <label className="check"><input {...rest} type="checkbox" /><span>{children}</span></label>;
}

export function Radio({ children, ...rest }: CheckProps) {
  return <label className="check"><input {...rest} type="radio" /><span>{children}</span></label>;
}

export function Switch({ children, ...rest }: CheckProps) {
  return <label className="switch"><input {...rest} type="checkbox" role="switch" /><span>{children}</span></label>;
}

/* Controlo segmentado: grupo de opções nativo, com setas */
export function Segmented<T extends string>({ legend, value, onChange, options, name }: { legend: string; value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: ReactNode; disabled?: boolean }[]; name?: string }) {
  const auto = useId();
  return (
    <div className="seg" role="radiogroup" aria-label={legend}>
      {options.map((o) => (
        <label key={o.value}>
          <input type="radio" name={name ?? auto} value={o.value} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} />
          {o.icon}
          {o.label}
        </label>
      ))}
    </div>
  );
}

/* Lista pesquisável partilhada por multi-selecção e pesquisa de pessoa */
export type PickOption = { value: string; label: string; detail?: string };

function normal(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function SearchList({ listId, inputLabel, options, selected, onToggle, multiple }: { listId: string; inputLabel: string; options: PickOption[]; selected: string[]; onToggle: (v: string) => void; multiple: boolean }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const visible = useMemo(() => options.filter((o) => normal(`${o.label} ${o.detail ?? ""}`).includes(normal(q))).slice(0, 30), [options, q]);
  return (
    <div className="menu" style={{ marginTop: 4 }}>
      <span className="inp-wrap">
        <input
          className="inp" autoFocus placeholder={f.searchPlaceholder} aria-label={inputLabel} value={q}
          role="combobox" aria-expanded aria-controls={listId} aria-activedescendant={visible[active] ? `${listId}-${visible[active].value}` : undefined}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, visible.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Enter" && visible[active]) { e.preventDefault(); onToggle(visible[active].value); }
          }}
        />
        <Search size={16} className="inp-chevron" aria-hidden />
      </span>
      <ul id={listId} role="listbox" aria-multiselectable={multiple || undefined} className="mt-2 max-h-56 overflow-auto">
        {visible.length === 0 && <li className="p-3 text-body text-subtle">{f.noMatches}</li>}
        {visible.map((o, i) => (
          <li key={o.value} id={`${listId}-${o.value}`} role="option" aria-selected={selected.includes(o.value)} data-active={i === active} className="menu-item" onMouseEnter={() => setActive(i)} onClick={() => onToggle(o.value)}>
            <span className="flex-1 min-w-0">
              <span className="block">{o.label}</span>
              {o.detail && <span className="block text-caption text-subtle">{o.detail}</span>}
            </span>
            {selected.includes(o.value) && <span className="text-caption text-subtle">{f.selected}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function useDisclosure() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const onBlur = (e: React.FocusEvent) => { if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false); };
  const onKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); } };
  return { open, setOpen, ref, onBlur, onKeyDown };
}

export function MultiSelect({ label, hint, error, options, value, onChange, disabled }: FieldShell & { options: PickOption[]; value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const id = useId();
  const d = useDisclosure();
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="field" ref={d.ref} onBlur={d.onBlur} onKeyDown={d.onKeyDown}>
      <span className="field-label" id={`${id}-l`}>{label}</span>
      <button type="button" className="inp text-left" aria-labelledby={`${id}-l`} aria-expanded={d.open} aria-invalid={error ? true : undefined} disabled={disabled} onClick={() => d.setOpen((o) => !o)} style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
        {value.length === 0 ? <span className="text-subtle">{f.choose}</span> : f.selectedCount(value.length)}
      </button>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((v) => (
            <span key={v} className="fchip">
              {options.find((o) => o.value === v)?.label}
              <IconButton size="sm" label={f.remove(options.find((o) => o.value === v)?.label ?? "")} onClick={() => toggle(v)}><X size={14} aria-hidden /></IconButton>
            </span>
          ))}
        </div>
      )}
      {d.open && <SearchList listId={`${id}-list`} inputLabel={label} options={options} selected={value} onToggle={toggle} multiple />}
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-err">{error}</span>}
    </div>
  );
}

export function PersonPicker({ label, hint, error, people, value, onChange, disabled, id: idProp, required }: FieldShell & { people: PickOption[]; value?: string; onChange: (v?: string) => void; disabled?: boolean; id?: string }) {
  const auto = useId();
  const id = idProp ?? auto;
  const d = useDisclosure();
  const current = people.find((p) => p.value === value);
  return (
    <div className="field" ref={d.ref} onBlur={d.onBlur} onKeyDown={d.onKeyDown}>
      <span className="field-label" id={`${id}-l`}>{label}{required && <span className="field-req" aria-hidden>*</span>}</span>
      <button id={id} type="button" className="inp text-left" aria-labelledby={`${id}-l`} aria-expanded={d.open} aria-invalid={error ? true : undefined} disabled={disabled} onClick={() => d.setOpen((o) => !o)} style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
        {current ? current.label : <span className="text-subtle">{f.searchPerson}</span>}
      </button>
      {d.open && <SearchList listId={`${id}-list`} inputLabel={label} options={people} selected={value ? [value] : []} onToggle={(v) => { onChange(v === value ? undefined : v); d.setOpen(false); }} multiple={false} />}
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-err">{error}</span>}
    </div>
  );
}

/* Selector em árvore: unidades e pastas */
export type TreeNode = { id: string; label: string; children?: TreeNode[] };

function TreeRow({ node, depth, selected, onToggle }: { node: TreeNode; depth: number; selected: string[]; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(depth < 1);
  const has = !!node.children?.length;
  return (
    <li>
      <div className="flex items-center gap-1" style={{ paddingLeft: depth * 20 }}>
        {has ? (
          <IconButton size="sm" label={open ? f.collapse(node.label) : f.expand(node.label)} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
          </IconButton>
        ) : <span style={{ width: 32 }} aria-hidden />}
        <Checkbox checked={selected.includes(node.id)} onChange={() => onToggle(node.id)}>{node.label}</Checkbox>
      </div>
      {has && open && <ul>{node.children!.map((c) => <TreeRow key={c.id} node={c} depth={depth + 1} selected={selected} onToggle={onToggle} />)}</ul>}
    </li>
  );
}

export function TreeSelect({ label, nodes, value, onChange }: { label: string; nodes: TreeNode[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
      <legend className="field-label" style={{ padding: 0, marginBottom: 6 }}>{label}</legend>
      <ul className="flex flex-col gap-0.5">{nodes.map((n) => <TreeRow key={n.id} node={n} depth={0} selected={value} onToggle={toggle} />)}</ul>
    </fieldset>
  );
}

/* Envio de ficheiros, com arrastar e largar e progresso */
export function FileUpload({ label, hint, error, disabled, required, onFiles, id: idProp }: FieldShell & { disabled?: boolean; onFiles?: (names: string[]) => void; id?: string }) {
  const auto = useId();
  const id = idProp ?? auto;
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  useEffect(() => { onFiles?.(files.map((x) => x.name)); }, [files]); // eslint-disable-line react-hooks/exhaustive-deps
  const [over, setOver] = useState(false);
  const add = (list: FileList | null) => list && setFiles((p) => [...p, ...Array.from(list).map((x) => ({ name: x.name, size: x.size }))]);
  return (
    <div className="field">
      <span className="field-label">{label}{required && <span className="field-req" aria-hidden>*</span>}</span>
      <label
        htmlFor={id}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
        className="flex items-center gap-3 p-4 text-body"
        style={{ borderRadius: 16, border: `1px dashed ${error ? "var(--ds-status-err-fg)" : "var(--ds-border-field)"}`, background: over ? "var(--ds-toned-background)" : "transparent", cursor: disabled ? "not-allowed" : "pointer", color: disabled ? "var(--ds-content-disabled)" : undefined }}
      >
        <Paperclip size={20} aria-hidden />
        <span>{f.dropFiles}</span>
        <input id={id} type="file" multiple disabled={disabled} className="sr-only" onChange={(e) => add(e.target.files)} />
      </label>
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-err">{error}</span>}
      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((x, i) => (
            <li key={`${x.name}-${i}`} className="flex items-center gap-2 text-body">
              <span className="flex-1 truncate text-ink">{x.name}</span>
              <span className="text-caption text-subtle">{(x.size / 1024 / 1024).toLocaleString("pt-AO", { maximumFractionDigits: 1 })} MB</span>
              <IconButton size="sm" label={f.remove(x.name)} onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}><X size={14} aria-hidden /></IconButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
