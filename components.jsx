/* global React */
const { useState, useEffect, useMemo, useRef } = React;

// ----- ICONS -----
const Icon = {
  search: () => <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5" /><path d="m13 13-2.5-2.5" strokeLinecap="round" /></svg>,
  grid: () => <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" /><rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" /></svg>,
  list: () => <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 4h10M3 8h10M3 12h10" /></svg>,
  plus: () => <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>,
  close: () => <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m4 4 8 8M12 4l-8 8" /></svg>,
  pin: () => <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 1.5 9.7 5l3.8.6-2.7 2.7.6 3.8L8 10.4l-3.4 1.7.6-3.8L2.5 5.6 6.3 5 8 1.5z"/></svg>,
  pinOutline: () => <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"><path d="M8 1.5 9.7 5l3.8.6-2.7 2.7.6 3.8L8 10.4l-3.4 1.7.6-3.8L2.5 5.6 6.3 5 8 1.5z" /></svg>,
  ext: () => <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3H3v10h10v-3" /><path d="M9 3h4v4M8 8l5-5" /></svg>,
  sun: () => <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3" /><path strokeLinecap="round" d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1" /></svg>,
  moon: () => <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z"/></svg>,
  figma: () => <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><circle cx="8" cy="8" r="2.5" /><path d="M5.5 13.5a2 2 0 0 0 2-2v-2h-2a2 2 0 1 0 0 4zM5.5 8h2V4h-2a2 2 0 0 0 0 4zM8.5 4h2a2 2 0 0 1 0 4h-2V4z" /></svg>,
  doc: () => <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 2h6l3 3v9H4z" /><path d="M10 2v3h3M6 8h5M6 10.5h5M6 6h2" strokeLinecap="round" /></svg>,
  play: () => <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M5 3.5v9l8-4.5z" /></svg>,
  web: () => <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="5.5" /><ellipse cx="8" cy="8" rx="2.5" ry="5.5" /><path d="M2.5 8h11" /></svg>,
  chevron: () => <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m6 4 4 4-4 4" /></svg>,
  upload: () => <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 11V3M5 6l3-3 3 3M3 13h10" /></svg>,
  swatch: () => <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2.5" y="2.5" width="5" height="5" rx="1" /><rect x="8.5" y="2.5" width="5" height="5" rx="1" /><rect x="2.5" y="8.5" width="5" height="5" rx="1" /><rect x="8.5" y="8.5" width="5" height="5" rx="1" /></svg>,
  link: () => <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 4.5h2.5a3 3 0 0 1 0 6H9M7 11.5H4.5a3 3 0 0 1 0-6H7M5.5 8h5" /></svg>,
  color: () => <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><circle cx="5" cy="6" r="1.5" /><circle cx="11" cy="6" r="1.5" /><circle cx="8" cy="11" r="1.5" /><circle cx="8" cy="3" r="1.5" /></svg>,
  pencil: () => <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2l3 3-8 8H3v-3l8-8z" /></svg>,
  copyLink: () => <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 4.5H4.5a2.5 2.5 0 0 0 0 5h2M9.5 4.5h2a2.5 2.5 0 0 1 0 5h-2M5 7h6" /></svg>,
  check: () => <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5L13 4.5" /></svg>,
};

const PLATFORMS = [
  { key: "passenger", label: "Passenger",       color: "oklch(0.42 0.14 280)", bg: "oklch(0.92 0.08 280 / 0.88)", dot: "oklch(0.55 0.14 280)" },
  { key: "driver",    label: "Driver",           color: "oklch(0.38 0.14 155)", bg: "oklch(0.90 0.08 155 / 0.88)", dot: "oklch(0.55 0.14 155)" },
  { key: "marketing", label: "Marketing tools",  color: "oklch(0.42 0.14 38)",  bg: "oklch(0.94 0.08 38  / 0.88)", dot: "oklch(0.55 0.14 38)",  hidden: true },
];
const PLATFORM_META = Object.fromEntries(PLATFORMS.map(p => [p.key, p]));
const PLATFORM_TAGS = new Set(PLATFORMS.map(p => p.key));

// ----- STATUS META -----
const STATUS_META = {
  ongoing: { label: "Ongoing", color: "var(--s-ongoing)", soft: "var(--s-ongoing-soft)" },
  shipped: { label: "Shipped", color: "var(--s-shipped)", soft: "var(--s-shipped-soft)" },
  hold:    { label: "On hold", color: "var(--s-hold)",    soft: "var(--s-hold-soft)" },
  archived:{ label: "Archived",color: "var(--s-archived)",soft: "var(--s-archived-soft)" },
};

// ----- COVER ART -----
function CoverArt({ cover, label }) {
  if (!cover) return <div className="card-cover-art">cover</div>;
  if (cover.kind === "image" && cover.src) {
    return <img src={cover.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  if (cover.kind === "figma-thumb") {
    if (cover.thumbUrl) return <img src={cover.thumbUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />;
    return <div className="card-cover-art" style={{ flexDirection: "column", gap: 4, opacity: 0.5 }}><Icon.figma />Figma thumbnail</div>;
  }
  if (cover.kind === "color-text") {
    const len = (cover.text || "").length;
    const fs = len > 20 ? 20 : len > 10 ? 28 : 42;
    return (
      <div style={{ position: "absolute", inset: 0, background: cover.bg || "#e8eeff", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        {cover.text && <span style={{ fontFamily: "var(--display)", fontSize: fs, fontWeight: 700, color: cover.textColor || "#1a2a6c", textAlign: "center", lineHeight: 1.2 }}>{cover.text}</span>}
      </div>
    );
  }
  const style = {
    "--c1": cover.c1, "--c2": cover.c2, "--c3": cover.c3, "--angle": cover.angle,
  };
  if (cover.kind === "stripes") return (
    <>
      <div className="cover-stripes" style={style} />
      {label && <div className="card-cover-art" style={{ color: "oklch(0.30 0.04 60 / 0.55)", mixBlendMode: "multiply" }}>{label}</div>}
    </>
  );
  if (cover.kind === "blob") return (
    <>
      <div className="cover-blob" style={style} />
      {label && <div className="card-cover-art" style={{ color: "oklch(0.30 0.04 60 / 0.45)" }}>{label}</div>}
    </>
  );
  if (cover.kind === "grid") return (
    <>
      <div className="cover-grid-bg" style={style} />
      {label && <div className="card-cover-art" style={{ color: "oklch(0.30 0.04 60 / 0.5)" }}>{label}</div>}
    </>
  );
  if (cover.kind === "type") return (
    <div className="cover-type" style={style}>
      <span style={{ fontSize: 110, lineHeight: 1, fontStyle: "italic" }}>{cover.text || "Aa"}</span>
    </div>
  );
  return null;
}

// ----- FIGMA THUMBNAIL FETCH -----
async function fetchFigmaThumb(figmaUrl, token) {
  const match = String(figmaUrl).match(/figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/);
  if (!match) return null;
  try {
    const res = await fetch(`https://api.figma.com/v1/files/${match[1]}?depth=1`, {
      headers: { "X-Figma-Token": token },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnailUrl || null;
  } catch (e) { return null; }
}

// ----- INLINE EDITABLE TEXT -----
function Editable({ value, onCommit, placeholder, as = "span", className = "", style, multiline = false }) {
  const ref = useRef(null);
  const lastCommitted = useRef(value);

  // sync external changes when not focused
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value || "";
    }
    lastCommitted.current = value;
  }, [value]);

  const commit = () => {
    const v = ref.current?.textContent?.trim() || "";
    if (v !== lastCommitted.current) {
      lastCommitted.current = v;
      onCommit(v);
    }
  };

  const handleKey = (e) => {
    if (!multiline && e.key === "Enter") { e.preventDefault(); ref.current.blur(); }
    if (e.key === "Escape") {
      ref.current.textContent = lastCommitted.current || "";
      ref.current.blur();
    }
  };

  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={`editable ${className}`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck="false"
      data-empty={value ? "0" : "1"}
      data-placeholder={placeholder || ""}
      onBlur={commit}
      onKeyDown={handleKey}
      onInput={(e) => { e.currentTarget.setAttribute("data-empty", e.currentTarget.textContent ? "0" : "1"); }}
    >{value || ""}</Tag>
  );
}

// ----- STATUS BADGE (editable) -----
function StatusBadge({ status, editable, onChange }) {
  const m = STATUS_META[status] || STATUS_META.ongoing;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [open]);

  if (!editable) {
    return (
      <span className="status-badge" style={{ background: m.soft, color: m.color }}>
        <i className="dot" style={{ background: m.color }} />
        {m.label}
      </span>
    );
  }
  return (
    <span ref={ref} style={{ position: "relative" }}>
      <button
        className="status-badge status-edit"
        style={{ background: m.soft, color: m.color }}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        title="Change status"
      >
        <i className="dot" style={{ background: m.color }} />
        {m.label}
        <span style={{ marginLeft: 2, opacity: 0.6, fontSize: 9 }}>▾</span>
      </button>
      {open && (
        <div className="menu" style={{ top: "calc(100% + 6px)", left: 0 }}>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <button key={k} className="menu-item" onClick={(e) => { e.stopPropagation(); onChange(k); setOpen(false); }}>
              <span className="dot" style={{ background: v.color, width: 7, height: 7, borderRadius: "50%", display: "inline-block" }} />
              {v.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

// ----- PRIORITY DOTS -----
const PRIORITY_OPTIONS = [
  { value: 0, label: "—",    short: "—"  },
  { value: 1, label: "Low",  short: "Low"  },
  { value: 2, label: "Mid",  short: "Mid"  },
  { value: 3, label: "High", short: "High" },
];

function PriorityDots({ value, editable, onChange }) {
  const opt = PRIORITY_OPTIONS.find(o => o.value === value) || PRIORITY_OPTIONS[0];
  if (!editable) {
    if (!value) return null;
    return (
      <span className="priority-badge" data-level={value} title={`Priority: ${opt.label}`}>
        {opt.short}
      </span>
    );
  }
  return (
    <select
      className="priority-select"
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value))}
      onClick={(e) => e.stopPropagation()}
    >
      {PRIORITY_OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ----- TEAM / PLATFORM SELECT -----
function TeamSelect({ value, onChange }) {
  return (
    <select
      className="priority-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      style={{ color: PLATFORM_META[value]?.color }}
    >
      <option value="">No platform</option>
      {PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
    </select>
  );
}

// ----- TAG EDITOR -----
function TagEditor({ tags, onChange }) {
  const [adding, setAdding] = useState("");
  const [hint, setHint] = useState(false);
  const add = () => {
    const v = adding.trim().toLowerCase().replace(/^#/, "");
    if (PLATFORM_TAGS.has(v)) { setHint(true); setAdding(""); setTimeout(() => setHint(false), 2500); return; }
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setAdding("");
  };
  return (
    <div className="tag-editor">
      {tags.filter(t => !PLATFORM_TAGS.has(t)).map(t => (
        <span key={t} className="tag-chip">
          #{t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} title="Remove tag">×</button>
        </span>
      ))}
      <input
        value={adding}
        onChange={(e) => { setAdding(e.target.value); setHint(false); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !adding && tags.filter(t => !PLATFORM_TAGS.has(t)).length)
            onChange(tags.filter(t => !PLATFORM_TAGS.has(t)).slice(0, -1).concat(tags.filter(t => PLATFORM_TAGS.has(t))));
        }}
        onBlur={add}
        placeholder="+ add tag"
      />
      {hint && <span style={{ fontSize: 11, color: "var(--ink-3)", alignSelf: "center" }}>Use Platform dropdown ↑</span>}
    </div>
  );
}

// ----- LINK ICON -----
function LinkIconFor(kind) {
  if (kind === "figma") return { cls: "figma", icon: <Icon.figma /> };
  if (kind === "doc") return { cls: "doc", icon: <Icon.doc /> };
  if (kind === "web") return { cls: "web", icon: <Icon.web /> };
  return { cls: "proto", icon: <Icon.play /> };
}

// ----- CARD -----
function copyProjectLink(id) {
  const url = `${window.location.origin}${window.location.pathname}?project=${id}`;
  return navigator.clipboard.writeText(url);
}

function ProjectCard({ project, onOpen, onPin }) {
  const [copied, setCopied] = useState(false);
  const totalLinks = (project.figma?.length || 0) + (project.proto?.length || 0) + (project.docs?.length || 0);
  const platform = project.tags?.find(t => PLATFORM_META[t]);
  const pm = platform ? PLATFORM_META[platform] : null;
  const otherTags = project.tags?.filter(t => !PLATFORM_TAGS.has(t)) || [];
  return (
    <article className="card" data-platform={platform || ""} onClick={() => onOpen(project.id)}>
      <div className="card-cover">
        <CoverArt cover={project.cover} label={project.coverLabel} />
        {pm && (
          <span className="card-platform-badge" style={{ background: pm.bg, color: pm.color }}>
            {pm.label}
          </span>
        )}
        <button
          className={`card-copy-link${copied ? " copied" : ""}`}
          onClick={(e) => { e.stopPropagation(); copyProjectLink(project.id).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}
          title="Copy link"
        >
          {copied ? <Icon.check /> : <Icon.copyLink />}
        </button>
        <button
          className={`card-pin ${project.pinned ? "pinned" : ""}`}
          onClick={(e) => { e.stopPropagation(); onPin(project.id); }}
          title={project.pinned ? "Unpin" : "Pin"}
        >
          {project.pinned ? <Icon.pin /> : <Icon.pinOutline />}
        </button>
      </div>
      <div className="card-body">
        <div className="card-row">
          <StatusBadge status={project.status} />
          <PriorityDots value={project.priority} />
        </div>
        <h3 className="card-title">{project.title}</h3>
        <p className="card-desc">{project.desc}</p>
        <div className="card-meta">
          <div className="links-row">
            {project.figma?.length > 0 && (
              <span className="link-chip" title={`${project.figma.length} Figma file${project.figma.length > 1 ? "s" : ""}`}>
                <span className="link-chip-glyph"><Icon.figma /></span>
                {project.figma.length}
              </span>
            )}
            {project.proto?.length > 0 && (
              <span className="link-chip" title={`${project.proto.length} prototype${project.proto.length > 1 ? "s" : ""}`}>
                <span className="link-chip-glyph"><Icon.play /></span>
                {project.proto.length}
              </span>
            )}
            {project.docs?.length > 0 && (
              <span className="link-chip" title={`${project.docs.length} doc${project.docs.length > 1 ? "s" : ""}`}>
                <span className="link-chip-glyph"><Icon.doc /></span>
                {project.docs.length}
              </span>
            )}
            {totalLinks === 0 && (
              <span className="tag-mini" style={{ opacity: 0.5 }}>no links</span>
            )}
          </div>
          <span className="updated">{project.updated}</span>
        </div>
        {otherTags.length > 0 && (
          <div className="tags-row">
            {otherTags.map(t => <span key={t} className="tag-mini">{t}</span>)}
          </div>
        )}
      </div>
    </article>
  );
}

// ----- LIST ROW -----
function ListRow({ project, onOpen, onPin }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="list-row" onClick={() => onOpen(project.id)}>
      <button
        className={`card-pin ${project.pinned ? "pinned" : ""}`}
        style={{ position: "static", opacity: project.pinned ? 1 : 0.4, width: 22, height: 22 }}
        onClick={(e) => { e.stopPropagation(); onPin(project.id); }}
      >
        {project.pinned ? <Icon.pin /> : <Icon.pinOutline />}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="list-thumb" style={{ position: "relative", overflow: "hidden" }}>
          <CoverArt cover={project.cover} />
        </div>
        <span className="list-title">{project.title}</span>
      </div>
      <StatusBadge status={project.status} />
      <PriorityDots value={project.priority} />
      <div className="list-tags">
        {project.tags?.slice(0, 3).map(t => <span key={t} className="tag-mini">{t}</span>)}
      </div>
      <div className="links-row" style={{ justifySelf: "start" }}>
        {project.figma?.length > 0 && <span className="link-chip"><Icon.figma />{project.figma.length}</span>}
        {project.proto?.length > 0 && <span className="link-chip"><Icon.play />{project.proto.length}</span>}
        {project.docs?.length > 0 && <span className="link-chip"><Icon.doc />{project.docs.length}</span>}
      </div>
      <span className="updated" style={{ marginLeft: 0 }}>{project.updated}</span>
      <button
        className={`card-copy-link${copied ? " copied" : ""}`}
        style={{ position: "static" }}
        onClick={(e) => { e.stopPropagation(); copyProjectLink(project.id).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}
        title="Copy link"
      >
        {copied ? <Icon.check /> : <Icon.copyLink />}
      </button>
      <Icon.chevron />
    </div>
  );
}

// ----- COVER EDITOR -----
function CoverEditor({ project, onChange }) {
  const fileRef = useRef(null);
  const [mode, setMode] = useState(null); // null | "pattern" | "url" | "color-text" | "figma-token"
  const [url, setUrl] = useState("");
  const [colorBg, setColorBg] = useState("#dde8ff");
  const [colorText, setColorText] = useState("");
  const [token, setToken] = useState(() => { try { return localStorage.getItem("figma_token") || ""; } catch(e) { return ""; } });
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!mode) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setMode(null); };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [mode]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ kind: "image", src: reader.result });
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const doFigmaFetch = async (tok) => {
    const firstUrl = project.figma?.[0]?.url;
    if (!firstUrl) { setFetchError("No Figma link on this project yet"); return; }
    setFetching(true);
    setFetchError("");
    const thumbUrl = await fetchFigmaThumb(firstUrl, tok);
    setFetching(false);
    if (thumbUrl) {
      onChange({ kind: "figma-thumb", thumbUrl });
      setMode(null);
    } else {
      setFetchError("Could not load thumbnail — check token or file access");
    }
  };

  const handleFigmaClick = () => {
    const stored = localStorage.getItem("figma_token");
    if (stored) { doFigmaFetch(stored); }
    else { setMode("figma-token"); }
  };

  const saveToken = () => {
    const t = token.trim();
    if (!t) return;
    localStorage.setItem("figma_token", t);
    setMode(null);
    doFigmaFetch(t);
  };

  const presets = [
    { kind: "stripes", c1: "oklch(0.78 0.10 252)", c2: "oklch(0.92 0.04 252)", angle: "55deg" },
    { kind: "blob",    c1: "oklch(0.85 0.10 252)", c2: "oklch(0.85 0.08 320)", c3: "oklch(0.97 0.02 252)" },
    { kind: "grid",    c2: "oklch(0.75 0.08 252 / 0.4)", c3: "oklch(0.96 0.02 252)" },
    { kind: "type",    c1: "oklch(0.45 0.18 252)", c3: "oklch(0.94 0.04 252)", text: project.title?.slice(0, 2) || "Aa" },
  ];

  return (
    <div
      ref={ref}
      className="drawer-cover"
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("dropping"); }}
      onDragLeave={(e) => e.currentTarget.classList.remove("dropping")}
      onDrop={(e) => { e.currentTarget.classList.remove("dropping"); onDrop(e); }}
    >
      <CoverArt cover={project.cover} label={project.coverLabel} />

      <div className="cover-overlay">
        {/* Upload */}
        <button className="cover-btn" onClick={() => fileRef.current?.click()}>
          <Icon.upload /> Upload
        </button>

        {/* Pattern */}
        <button className="cover-btn" onClick={() => setMode(mode === "pattern" ? null : "pattern")}>
          <Icon.swatch /> Pattern
        </button>

        {/* Color + text */}
        <button className="cover-btn" onClick={() => setMode(mode === "color-text" ? null : "color-text")}>
          <Icon.color /> Color
        </button>

        {/* Figma thumbnail */}
        <button className="cover-btn" onClick={handleFigmaClick} disabled={fetching} style={{ opacity: fetching ? 0.6 : 1 }}>
          <Icon.figma /> {fetching ? "Loading…" : "Figma"}
        </button>

        {/* URL */}
        <button className="cover-btn" onClick={() => setMode(mode === "url" ? null : "url")}>
          <Icon.link /> URL
        </button>

        {/* Pattern picker */}
        {mode === "pattern" && (
          <div className="cover-presets">
            {presets.map((p, i) => (
              <button key={i} className="cover-preset" onClick={() => { onChange(p); setMode(null); }} title={p.kind}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", overflow: "hidden" }}>
                  <CoverArt cover={p} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color + text form */}
      {mode === "color-text" && (
        <div className="cover-url-form" onClick={(e) => e.stopPropagation()}>
          <input
            type="color"
            value={colorBg}
            onChange={(e) => setColorBg(e.target.value)}
            title="Background color"
            style={{ width: 34, height: 34, padding: 2, border: "1px solid var(--line)", borderRadius: 6, cursor: "pointer", flexShrink: 0 }}
          />
          <input
            autoFocus
            value={colorText}
            onChange={(e) => setColorText(e.target.value)}
            placeholder="Text on cover…"
            onKeyDown={(e) => {
              if (e.key === "Enter") { onChange({ kind: "color-text", bg: colorBg, text: colorText }); setMode(null); }
              if (e.key === "Escape") setMode(null);
            }}
          />
          <button className="save" onClick={() => { onChange({ kind: "color-text", bg: colorBg, text: colorText }); setMode(null); }}>Set</button>
        </div>
      )}

      {/* URL form */}
      {mode === "url" && (
        <div className="cover-url-form" onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… image URL"
            onKeyDown={(e) => {
              if (e.key === "Enter" && url.trim()) { onChange({ kind: "image", src: url.trim() }); setUrl(""); setMode(null); }
              if (e.key === "Escape") { setMode(null); setUrl(""); }
            }}
          />
          <button className="save" onClick={() => { if (url.trim()) { onChange({ kind: "image", src: url.trim() }); setUrl(""); setMode(null); } }}>Set</button>
        </div>
      )}

      {/* Figma token form */}
      {mode === "figma-token" && (
        <div className="cover-url-form" onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Figma personal access token…"
            onKeyDown={(e) => {
              if (e.key === "Enter") saveToken();
              if (e.key === "Escape") setMode(null);
            }}
          />
          <button className="save" onClick={saveToken}>Save & fetch</button>
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <div style={{ position: "absolute", bottom: 8, left: 12, right: 12, fontSize: 11, color: "oklch(0.45 0.16 25)", background: "var(--paper)", padding: "4px 8px", borderRadius: 6, textAlign: "center" }}>
          {fetchError}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
      <div className="cover-hint">Upload · Pattern · Color · Figma · URL</div>
    </div>
  );
}

// ----- DUPLICATE DETECTOR -----
function projectWarning(title, allProjects, currentId) {
  if (!title || title.trim().length < 2) return null;
  const norm = (s) => s.toLowerCase().trim();
  // significant words: length > 3, not pure numbers/versions
  const sigWords = (s) => s.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !/^v?\d+$/.test(w));

  const tw = new Set(sigWords(title));
  const exact = [], related = [];
  allProjects.forEach(p => {
    if (p.id === currentId) return;
    if (norm(p.title) === norm(title)) {
      exact.push(p.title);
    } else if (tw.size > 0) {
      const shared = sigWords(p.title).filter(w => tw.has(w)).length;
      if (shared >= 1) related.push(p.title);
    }
  });
  return { exact, related };
}

// ----- DRAWER (editable) -----
function DetailDrawer({ project, projects, onClose, onUpdate, onDelete, onDuplicate }) {
  const open = !!project;
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setMenuOpen(false);
    setConfirmDelete(false);
    const handler = (e) => { if (e.key === "Escape") { setMenuOpen(false); setConfirmDelete(false); onClose(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, project?.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [menuOpen]);

  const patch = (p) => onUpdate({ ...project, ...p, updated: "Just now" });
  const addLink = (kind, link) => {
    const key = kind === "doc" ? "docs" : kind === "figma" ? "figma" : "proto";
    const arr = project[key] || [];
    patch({ [key]: [...arr, link] });
  };
  const removeLink = (kind, idx) => {
    const key = kind === "doc" ? "docs" : kind === "figma" ? "figma" : "proto";
    const arr = (project[key] || []).filter((_, i) => i !== idx);
    patch({ [key]: arr });
  };
  const updateLink = (kind, idx, link) => {
    const key = kind === "doc" ? "docs" : kind === "figma" ? "figma" : "proto";
    const arr = [...(project[key] || [])];
    arr[idx] = link;
    patch({ [key]: arr });
  };

  return (
    <>
      <div className={`drawer-bg ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        {project && (
          <>
            <div className="drawer-head">
              <div className="drawer-head-left">
                <span>Project</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>{project.id}</span>
              </div>
              <div className="drawer-actions" style={{ position: "relative" }} ref={menuRef}>
                <button
                  className={`icon-btn ${project.pinned ? "active" : ""}`}
                  onClick={() => patch({ pinned: !project.pinned })}
                  title={project.pinned ? "Unpin" : "Pin"}
                >
                  {project.pinned ? <Icon.pin /> : <Icon.pinOutline />}
                </button>
                <button className="icon-btn" onClick={() => setMenuOpen(!menuOpen)} title="More">
                  <span style={{ fontSize: 18, lineHeight: 1, letterSpacing: 1 }}>···</span>
                </button>
                {menuOpen && (
                  <div className="menu" style={{ top: "calc(100% + 6px)", right: 0 }}>
                    <button className="menu-item" onClick={() => { onDuplicate(project); setMenuOpen(false); }}>
                      <Icon.plus /> Duplicate
                    </button>
                    <button className="menu-item" onClick={() => { navigator.clipboard?.writeText(project.id); setMenuOpen(false); }}>
                      <Icon.ext /> Copy project ID
                    </button>
                    <div className="menu-divider" />
                    <button className="menu-item danger" onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}>
                      <Icon.close /> Delete project
                    </button>
                  </div>
                )}
                <button className="icon-btn" onClick={onClose} title="Close (Esc)"><Icon.close /></button>
              </div>
            </div>
            <div className="drawer-body">
              <CoverEditor project={project} onChange={(c) => patch({ cover: c })} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <StatusBadge status={project.status} editable onChange={(v) => patch({ status: v })} />
                <PriorityDots value={project.priority} editable onChange={(v) => patch({ priority: v })} />
                <TeamSelect
                  value={PLATFORMS.find(p => project.tags?.includes(p.key))?.key || ""}
                  onChange={(team) => {
                    const base = (project.tags || []).filter(t => !PLATFORM_TAGS.has(t));
                    patch({ tags: team ? [team, ...base] : base });
                  }}
                />
              </div>
              <Editable
                as="h1"
                className="drawer-title"
                value={project.title}
                placeholder="Untitled project"
                onCommit={(v) => patch({ title: v || "Untitled" })}
              />
              {(() => {
                const w = projectWarning(project.title, projects || [], project.id);
                if (!w) return null;
                if (w.exact.length > 0) return (
                  <div style={{ fontSize: 12, color: "oklch(0.48 0.14 38)", background: "oklch(0.96 0.04 38)", borderRadius: 8, padding: "6px 10px", marginBottom: 4 }}>
                    ⚠ Project with this exact name already exists
                  </div>
                );
                if (w.related.length > 0) return (
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>
                    Related: {w.related.join(", ")}
                  </div>
                );
                return null;
              })()}
              <Editable
                as="p"
                className="drawer-desc"
                value={project.desc}
                placeholder="Add a one-line description…"
                multiline
                onCommit={(v) => patch({ desc: v })}
              />

              <div className="section-h">Tags</div>
              <TagEditor tags={project.tags || []} onChange={(v) => patch({ tags: v })} />

              <div className="detail-grid">
                <div className="detail-label">Started</div>
                <div className="detail-value">
                  <Editable value={project.started || ""} placeholder="—" onCommit={(v) => patch({ started: v })} />
                </div>
                <div className="detail-label">Updated</div>
                <div className="detail-value" style={{ color: "var(--ink-3)" }}>{project.updated || "—"}</div>
                {(project.shipped || project.status === "shipped") && <>
                  <div className="detail-label">Shipped</div>
                  <div className="detail-value">
                    <Editable value={project.shipped || ""} placeholder="—" onCommit={(v) => patch({ shipped: v })} />
                  </div>
                </>}
                <div className="detail-label">Stakeholders</div>
                <div className="detail-value">
                  <Editable
                    value={(project.stakeholders || []).join(", ")}
                    placeholder="Mia (PM), Sam (Eng)…"
                    onCommit={(v) => patch({ stakeholders: v.split(",").map(s => s.trim()).filter(Boolean) })}
                  />
                </div>
              </div>

              <LinkSection
                title="Figma files"
                kind="figma"
                placeholder="figma.com/file/…"
                links={project.figma || []}
                onAdd={(l) => addLink("figma", l)}
                onRemove={(i) => removeLink("figma", i)}
                onUpdate={(i, l) => updateLink("figma", i, l)}
              />

              <LinkSection
                title="Prototypes"
                kind="proto"
                placeholder="proto.acme.com/… or figma.com/proto/…"
                links={project.proto || []}
                onAdd={(l) => addLink("proto", l)}
                onRemove={(i) => removeLink("proto", i)}
                onUpdate={(i, l) => updateLink("proto", i, l)}
                showKindToggle
              />

              <LinkSection
                title="Related docs"
                kind="doc"
                placeholder="docs.google.com/document/d/… or slides/…"
                links={project.docs || []}
                onAdd={(l) => addLink("doc", l)}
                onRemove={(i) => removeLink("doc", i)}
                onUpdate={(i, l) => updateLink("doc", i, l)}
              />

              <div className="section-h">Notes</div>
              <Editable
                as="div"
                className="notes"
                value={project.notes || ""}
                placeholder="Jot down decisions, blockers, next steps…"
                multiline
                onCommit={(v) => patch({ notes: v })}
              />

              {project.history?.length > 0 && (
                <>
                  <div className="section-h">Activity</div>
                  <div className="history">
                    {project.history.map((h, i) => (
                      <div key={i} className="history-row">
                        <span className="history-date">{h.date}</span>
                        <span className="history-text">{h.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="danger-zone" style={{ position: "relative" }}>
                <span className="danger-zone-text">Deleting removes the card and all its links. Can't undo.</span>
                <button className="danger-btn" onClick={() => setConfirmDelete(true)}>Delete project</button>
                {confirmDelete && (
                  <div className="confirm-pop">
                    <p>Delete <strong>{project.title}</strong>?</p>
                    <div className="row">
                      <button className="ghost-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
                      <button className="danger-btn" onClick={() => { onDelete(project.id); setConfirmDelete(false); }}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// ----- LINK SECTION -----
function LinkSection({ title, kind, placeholder, links, onAdd, onRemove, onUpdate, showKindToggle }) {
  const [adding, setAdding] = useState(false);
  const [editState, setEditState] = useState(null); // null | { idx, name, url, kind }
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [linkKind, setLinkKind] = useState(kind === "proto" ? "web" : kind);

  const submit = () => {
    if (!url.trim()) return;
    const cleanUrl = url.trim().replace(/^https?:\/\//, "");
    const link = { name: name.trim() || titleFromUrl(cleanUrl), url: cleanUrl };
    if (kind === "proto") link.kind = linkKind;
    onAdd(link);
    setName(""); setUrl(""); setAdding(false);
  };

  const startEdit = (e, i) => {
    e.preventDefault(); e.stopPropagation();
    setEditState({ idx: i, name: links[i].name || "", url: links[i].url || "", kind: links[i].kind || (kind === "proto" ? "web" : kind) });
    setAdding(false);
  };

  const submitEdit = () => {
    if (!editState.url.trim()) return;
    const cleanUrl = editState.url.trim().replace(/^https?:\/\//, "");
    const link = { name: editState.name.trim() || titleFromUrl(cleanUrl), url: cleanUrl };
    if (kind === "proto") link.kind = editState.kind;
    onUpdate(editState.idx, link);
    setEditState(null);
  };

  return (
    <>
      <div className="section-h">{title} <span style={{ color: "var(--ink-3)", marginLeft: 4 }}>({links.length})</span></div>
      <div className="link-list">
        {links.map((l, i) => editState?.idx === i ? (
          <div key={i} className="add-link-form" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={editState.url}
              onChange={(e) => setEditState(s => ({ ...s, url: e.target.value }))}
              placeholder={placeholder}
              onKeyDown={(e) => { if (e.key === "Enter") submitEdit(); if (e.key === "Escape") setEditState(null); }}
            />
            <input
              value={editState.name}
              onChange={(e) => setEditState(s => ({ ...s, name: e.target.value }))}
              placeholder="Label (optional)"
              onKeyDown={(e) => { if (e.key === "Enter") submitEdit(); if (e.key === "Escape") setEditState(null); }}
            />
            {showKindToggle && (
              <div style={{ display: "flex", gap: 6 }}>
                {["web", "figma"].map(k => (
                  <button key={k} onClick={() => setEditState(s => ({ ...s, kind: k }))} style={{ flex: 1, padding: "6px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--line)", background: editState.kind === k ? "var(--ink)" : "var(--paper)", color: editState.kind === k ? "var(--bg)" : "var(--ink-2)" }}>
                    {k === "web" ? "Webapp" : "Figma"}
                  </button>
                ))}
              </div>
            )}
            <div className="row">
              <button className="cancel" onClick={() => setEditState(null)}>Cancel</button>
              <button className="save" onClick={submitEdit}>Save</button>
            </div>
          </div>
        ) : (
          <a
            key={i}
            className="link-row"
            href={`https://${l.url}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const k = kind === "proto" ? (l.kind || "proto") : kind;
              const { cls, icon } = LinkIconFor(k);
              return <span className={`link-icon ${cls}`}>{icon}</span>;
            })()}
            <span className="link-meta">
              <span className="link-name">{l.name}</span>
              <span className="link-url">{l.url}</span>
            </span>
            <span className="link-ext"><Icon.ext /></span>
            <button className="link-edit" onClick={(e) => startEdit(e, i)} title="Edit link"><Icon.pencil /></button>
            <button
              className="link-remove"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(i); }}
              title="Remove link"
            ><Icon.close /></button>
          </a>
        ))}
        {adding ? (
          <div className="add-link-form" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Label (optional)"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {showKindToggle && (
              <div style={{ display: "flex", gap: 6 }}>
                {["web", "figma"].map(k => (
                  <button
                    key={k}
                    onClick={() => setLinkKind(k)}
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontFamily: "var(--mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      border: "1px solid var(--line)",
                      background: linkKind === k ? "var(--ink)" : "var(--paper)",
                      color: linkKind === k ? "var(--bg)" : "var(--ink-2)",
                    }}
                  >
                    {k === "web" ? "Webapp" : "Figma"}
                  </button>
                ))}
              </div>
            )}
            <div className="row">
              <button className="cancel" onClick={() => { setAdding(false); setName(""); setUrl(""); }}>Cancel</button>
              <button className="save" onClick={submit}>Add link</button>
            </div>
          </div>
        ) : (
          <button className="add-link-btn" onClick={(e) => { e.stopPropagation(); setAdding(true); }}>
            <Icon.plus /> Add {kind === "doc" ? "doc" : kind === "figma" ? "Figma file" : "prototype"}
          </button>
        )}
      </div>
    </>
  );
}

function titleFromUrl(u) {
  if (u.includes("figma.com")) return "Figma file";
  if (u.includes("docs.google.com/document")) return "Google Doc";
  if (u.includes("docs.google.com/presentation")) return "Google Slides";
  if (u.includes("docs.google.com/spreadsheets")) return "Google Sheet";
  return "Link";
}

Object.assign(window, {
  PLATFORMS, Icon, STATUS_META, CoverArt, StatusBadge, PriorityDots, Editable, TagEditor, TeamSelect,
  ProjectCard, ListRow, DetailDrawer, LinkSection, LinkIconFor,
});
