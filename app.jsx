/* global React, ReactDOM, SEED_PROJECTS, ALL_TAGS, SUPABASE_URL, SUPABASE_ANON_KEY,
   Icon, ProjectCard, ListRow, DetailDrawer, AddProjectModal,
   useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle, TweakSelect
*/
const { useState, useEffect, useMemo, useRef } = React;

// ----- Supabase client -----
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function dbLoad() {
  const { data: rows, error } = await db.from("projects").select("id, data").order("created_at");
  if (error) { console.error("load:", error); return null; }
  return rows.map(r => r.data);
}
async function dbUpsert(project) {
  const { error } = await db.from("projects").upsert({ id: project.id, data: project });
  if (error) console.error("upsert:", error);
}
async function dbInsert(project) {
  const { error } = await db.from("projects").insert({ id: project.id, data: project });
  if (error) console.error("insert:", error);
}
async function dbInsertMany(projects) {
  const rows = projects.map(p => ({ id: p.id, data: p }));
  const { error } = await db.from("projects").insert(rows);
  if (error) console.error("insertMany:", error);
}
async function dbDelete(id) {
  const { error } = await db.from("projects").delete().eq("id", id);
  if (error) console.error("delete:", error);
}

// ----- Tweaks -----
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "rgb(6, 92, 206)",
  "density": "cozy",
  "displayFont": "Poppins",
  "theme": "light"
}/*EDITMODE-END*/;

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("updated");
  const [openId, setOpenId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [inboxText, setInboxText] = useState("");

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // load from Supabase on mount
  useEffect(() => {
    dbLoad().then(rows => {
      if (rows === null) { setLoading(false); return; }
      if (rows.length === 0) {
        // first run — seed with sample data
        dbInsertMany(SEED_PROJECTS).then(() => setProjects(SEED_PROJECTS));
      } else {
        setProjects(rows);
      }
      setLoading(false);
    });
  }, []);

  // apply theme + tweaks
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    document.documentElement.setAttribute("data-density", t.density);
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--display", `"${t.displayFont}", sans-serif`);
  }, [t.theme, t.density, t.accent, t.displayFont]);

  // counts
  const counts = useMemo(() => {
    const c = { all: projects.length, ongoing: 0, shipped: 0, hold: 0, archived: 0, adhoc: 0, pinned: 0 };
    projects.forEach(p => {
      c[p.status] = (c[p.status] || 0) + 1;
      if (p.tags?.includes("adhoc")) c.adhoc++;
      if (p.pinned) c.pinned++;
    });
    return c;
  }, [projects]);

  // filtered
  const filtered = useMemo(() => {
    let list = projects.slice();
    if (filter === "pinned") list = list.filter(p => p.pinned);
    else if (filter === "adhoc") list = list.filter(p => p.tags?.includes("adhoc"));
    else if (filter !== "all") list = list.filter(p => p.status === filter);
    if (tagFilter) list = list.filter(p => p.tags?.includes(tagFilter));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.desc || "").toLowerCase().includes(q) ||
        p.tags?.some(tg => tg.includes(q))
      );
    }
    if (sort === "priority") list.sort((a, b) => b.priority - a.priority);
    else if (sort === "alpha") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "started") list.sort((a, b) => (a.started > b.started ? -1 : 1));
    return list;
  }, [projects, filter, tagFilter, search, sort]);

  // grouped sections
  const groupedSections = useMemo(() => {
    if (filter !== "all" || tagFilter || search) {
      return [{ key: "results", title: null, items: filtered }];
    }
    const pinned   = filtered.filter(p => p.pinned);
    const active   = filtered.filter(p => !p.pinned && (p.status === "ongoing" || p.status === "hold"));
    const shipped  = filtered.filter(p => !p.pinned && p.status === "shipped");
    const archived = filtered.filter(p => !p.pinned && p.status === "archived");
    return [
      { key: "pinned",   title: pinned.length ? "Pinned" : null, items: pinned },
      { key: "active",   title: "In progress", items: active },
      { key: "shipped",  title: "Shipped",      items: shipped },
      { key: "archived", title: "Archived",     items: archived, faded: true },
    ].filter(s => s.items.length > 0);
  }, [filtered, filter, tagFilter, search]);

  const openProject = projects.find(p => p.id === openId);

  // handlers (optimistic update + background sync)
  const togglePin = (id) => {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p);
      dbUpsert(next.find(p => p.id === id));
      return next;
    });
  };
  const updateProject = (next) => {
    setProjects(prev => prev.map(p => p.id === next.id ? next : p));
    dbUpsert(next);
  };
  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setOpenId(null);
    dbDelete(id);
  };
  const duplicateProject = (project) => {
    const copy = {
      ...project,
      id: project.id + "-copy-" + Math.random().toString(36).slice(2, 5),
      title: project.title + " (copy)",
      pinned: false,
      updated: "Just now",
      started: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      history: [{ date: "Today", text: "Duplicated from " + project.title }, ...(project.history || [])],
    };
    setProjects(prev => [copy, ...prev]);
    setOpenId(copy.id);
    dbInsert(copy);
  };
  const addProject = (project) => {
    setProjects(prev => [project, ...prev]);
    setShowAdd(false);
    setOpenId(project.id);
    dbInsert(project);
  };
  const quickCapture = () => {
    if (!inboxText.trim()) return;
    const p = {
      id: "p-quick-" + Math.random().toString(36).slice(2, 7),
      title: inboxText.trim(),
      desc: "Quick capture — add details when you have a sec.",
      status: "ongoing",
      priority: 1,
      tags: ["adhoc"],
      cover: { kind: "stripes", c1: "oklch(0.85 0.04 60)", c2: "oklch(0.93 0.02 60)", angle: "0deg" },
      coverLabel: "ADHOC",
      figma: [], proto: [], docs: [],
      stakeholders: ["Self"],
      updated: "Just now",
      started: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      notes: "", history: [{ date: "Today", text: "Captured via inbox" }],
      pinned: false,
    };
    setProjects(prev => [p, ...prev]);
    setInboxText("");
    dbInsert(p);
  };

  // keyboard shortcuts
  const searchRef = useRef();
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") { e.preventDefault(); setShowAdd(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--sans)", color: "var(--ink-3)", fontSize: 14 }}>
      Loading…
    </div>
  );

  return (
    <div className="app">
      {/* ------- SIDEBAR ------- */}
      <aside className="sidebar" data-screen-label="sidebar">
        <div className="brand">
          <div>
            <div className="brand-mark"><span style={{ color: "var(--accent)" }}>MuvMi</span> <em style={{ color: "var(--ink)" }}>Design</em></div>
            <div className="brand-sub" style={{ marginTop: 4 }}>Personal index · 2026</div>
          </div>
        </div>

        <div className="nav-group">
          <NavItem icon="◆" label="All projects" count={counts.all} active={filter === "all" && !tagFilter} onClick={() => { setFilter("all"); setTagFilter(null); }} />
        </div>

        <div className="nav-group">
          <div className="nav-label">Status</div>
          <NavItem dotColor="var(--s-ongoing)" label="Ongoing"  count={counts.ongoing  || 0} active={filter === "ongoing"}  onClick={() => { setFilter("ongoing");  setTagFilter(null); }} />
          <NavItem dotColor="var(--s-shipped)" label="Shipped"  count={counts.shipped  || 0} active={filter === "shipped"}  onClick={() => { setFilter("shipped");  setTagFilter(null); }} />
          <NavItem dotColor="var(--s-hold)"    label="On hold"  count={counts.hold     || 0} active={filter === "hold"}     onClick={() => { setFilter("hold");     setTagFilter(null); }} />
          <NavItem dotColor="var(--s-archived)"label="Archived" count={counts.archived || 0} active={filter === "archived"} onClick={() => { setFilter("archived"); setTagFilter(null); }} />
        </div>

        <div className="nav-group">
          <div className="nav-label">Tags</div>
          <div className="tag-cloud">
            {ALL_TAGS.map(tag => (
              <button key={tag} className={`tag-pill ${tagFilter === tag ? "active" : ""}`}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "auto", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", lineHeight: 1.6 }}>
          <div>⌘K — search</div>
          <div>⌘N — new project</div>
          <div>Esc — close drawer</div>
        </div>
      </aside>

      {/* ------- MAIN ------- */}
      <main className="main">
        <div className="topbar">
          <div>
            <h1 className="page-title">{titleFor(filter, tagFilter, search)}</h1>
            <div className="page-sub">{filtered.length} project{filtered.length === 1 ? "" : "s"} · last touch today</div>
          </div>
          <div className="topbar-actions">
            <div className="search">
              <Icon.search />
              <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, tag, description…" />
              <span className="kbd">⌘K</span>
            </div>
            <button className={`icon-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")} title="Grid view"><Icon.grid /></button>
            <button className={`icon-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")} title="List view"><Icon.list /></button>
            <button className="icon-btn" onClick={() => setTweak("theme", t.theme === "light" ? "dark" : "light")} title="Toggle theme">
              {t.theme === "light" ? <Icon.moon /> : <Icon.sun />}
            </button>
            <button className="primary-btn" onClick={() => setShowAdd(true)}>
              <Icon.plus /> New project
            </button>
          </div>
        </div>

        {/* stats */}
        <div className="stats">
          <Stat label="Ongoing"  dot="var(--s-ongoing)"  value={counts.ongoing  || 0} delta="active projects" />
          <Stat label="Shipped"  dot="var(--s-shipped)"  value={counts.shipped  || 0} delta="completed"  up />
          <Stat label="On hold"  dot="var(--s-hold)"     value={counts.hold     || 0} delta="waiting on others" />
          <Stat label="Archived" dot="var(--s-archived)" value={counts.archived || 0} delta="lessons & references" />
        </div>

        {/* quick capture */}
        <div className="inbox">
          <span className="inbox-label">⌘ Quick capture</span>
          <input
            value={inboxText}
            onChange={(e) => setInboxText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && quickCapture()}
            placeholder="Ad-hoc work or thought — type and hit return to save…"
          />
          <span className="inbox-hint">↵ to save · tagged #adhoc</span>
        </div>

        {/* sort row */}
        <div className="section-head">
          <div className="section-title">
            Library <span className="count">{filtered.length} of {projects.length}</span>
          </div>
          <div className="section-tools">
            {tagFilter && (
              <button className="tag-pill active" onClick={() => setTagFilter(null)}>
                #{tagFilter} <span style={{ marginLeft: 6, opacity: 0.7 }}>×</span>
              </button>
            )}
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="updated">Recently updated</option>
              <option value="priority">Highest priority</option>
              <option value="started">Newest first</option>
              <option value="alpha">A → Z</option>
            </select>
          </div>
        </div>

        {/* sections */}
        {groupedSections.length === 0 && <div className="empty">No projects match.</div>}
        {groupedSections.map((section, idx) => (
          <div key={section.key} className={section.faded ? "archived-section" : ""}>
            {section.title && (
              <div className="section-divider"><span>{section.title}</span><div className="line" /></div>
            )}
            {view === "grid" ? (
              <div className="grid">
                {section.items.map(p => <ProjectCard key={p.id} project={p} onOpen={setOpenId} onPin={togglePin} />)}
              </div>
            ) : (
              <div className="list">
                <div className="list-head">
                  <span></span><span>Project</span><span>Status</span><span>Prio</span>
                  <span>Tags</span><span>Links</span><span>Updated</span><span></span>
                </div>
                {section.items.map(p => <ListRow key={p.id} project={p} onOpen={setOpenId} onPin={togglePin} />)}
              </div>
            )}
          </div>
        ))}
      </main>

      <DetailDrawer
        project={openProject}
        onClose={() => setOpenId(null)}
        onUpdate={updateProject}
        onDelete={deleteProject}
        onDuplicate={duplicateProject}
      />
      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} onSave={addProject} />}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance">
          <TweakRadio label="Theme" value={t.theme} onChange={(v) => setTweak("theme", v)} options={[{label:"Light",value:"light"},{label:"Dark",value:"dark"}]} />
          <TweakRadio label="Density" value={t.density} onChange={(v) => setTweak("density", v)} options={[{label:"Cozy",value:"cozy"},{label:"Compact",value:"compact"}]} />
        </TweakSection>
        <TweakSection label="Brand">
          <TweakColor label="Accent" value={t.accent} onChange={(v) => setTweak("accent", v)}
            options={["rgb(6, 92, 206)","oklch(0.55 0.14 155)","oklch(0.62 0.14 38)","oklch(0.55 0.14 320)","oklch(0.30 0.02 60)"]} />
          <TweakSelect label="Display font" value={t.displayFont} onChange={(v) => setTweak("displayFont", v)}
            options={["Poppins","Instrument Serif","Newsreader","Playfair Display","Geist"]} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function titleFor(filter, tag, search) {
  if (search) return <>Results <em>for</em></>;
  if (tag) return <>Tag <em>{tag}</em></>;
  if (filter === "ongoing")  return <>In <em>progress</em></>;
  if (filter === "shipped")  return <><em>Shipped</em> work</>;
  if (filter === "hold")     return <>On <em>hold</em></>;
  if (filter === "archived") return <>The <em>archive</em></>;
  if (filter === "adhoc")    return <><em>Ad-hoc</em> & quick</>;
  if (filter === "pinned")   return <><em>Pinned</em></>;
  return <>The <em>library</em></>;
}

function NavItem({ icon, dotColor, label, count, active, onClick }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      <span className="left">
        {dotColor
          ? <span className="nav-dot" style={{ background: dotColor }} />
          : <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-3)", width: 12, textAlign: "center" }}>{icon}</span>}
        {label}
      </span>
      <span className="nav-count">{count}</span>
    </button>
  );
}

function Stat({ label, value, dot, delta, up }) {
  return (
    <div className="stat">
      <div className="stat-label"><span className="stat-dot" style={{ background: dot }} />{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-delta ${up ? "up" : ""}`}>{delta}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
