/* global React, ReactDOM, SEED_PROJECTS, ALL_TAGS, SUPABASE_URL, SUPABASE_ANON_KEY,
   Icon, ProjectCard, ListRow, DetailDrawer, AddProjectModal, TeamSelect,
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
  if (error) { console.error("upsert:", error); return error; }
}
async function dbInsert(project) {
  // use upsert so duplicate-id retries don't fail
  const { error } = await db.from("projects").upsert({ id: project.id, data: project });
  if (error) { console.error("insert:", error); return error; }
}
async function dbInsertMany(projects) {
  const rows = projects.map(p => ({ id: p.id, data: p }));
  const { error } = await db.from("projects").upsert(rows);
  if (error) { console.error("insertMany:", error); return error; }
}
async function dbDelete(id) {
  const { error } = await db.from("projects").delete().eq("id", id);
  if (error) { console.error("delete:", error); return error; }
}

// ----- Tweaks -----
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "rgb(6, 92, 206)",
  "density": "cozy",
  "displayFont": "Poppins",
  "theme": "light"
}/*EDITMODE-END*/;

const ALLOWED_DOMAIN = "@umt.ltd";

function LoginScreen({ onSignIn, error }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", fontFamily: "var(--sans)",
    }}>
      <div style={{
        background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 20,
        padding: "48px 56px", textAlign: "center", maxWidth: 380, width: "100%",
        boxShadow: "0 20px 60px -20px oklch(0.18 0.01 60 / 0.15)",
      }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 32, marginBottom: 6 }}>
          <span style={{ color: "var(--accent)" }}>MuvMi</span> <em style={{ color: "var(--ink)" }}>Design</em>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 36 }}>
          Design Hub
        </div>
        <button
          onClick={onSignIn}
          style={{
            width: "100%", padding: "12px 20px", borderRadius: 10,
            border: "1px solid var(--line)", background: "var(--paper)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontSize: 14, fontWeight: 500, cursor: "pointer", color: "var(--ink)",
            transition: "border-color 120ms, box-shadow 120ms",
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = "var(--ink-3)"}
          onMouseOut={e => e.currentTarget.style.borderColor = "var(--line)"}
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Sign in with Google
        </button>
        {error && (
          <div style={{ marginTop: 16, fontSize: 12, color: "oklch(0.45 0.16 25)", background: "oklch(0.96 0.03 25)", borderRadius: 8, padding: "10px 14px" }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: 20, fontSize: 11, color: "var(--ink-3)" }}>
          Only <strong>@umt.ltd</strong> accounts are allowed
        </div>
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState(null); // null | "passenger" | "driver"
  const [tagFilter, setTagFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("updated");
  const [openId, setOpenId] = useState(null);
  const [inboxText, setInboxText] = useState("");

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // auth
  useEffect(() => {
    db.auth.getSession().then(({ data: { session } }) => {
      if (session && !session.user.email.endsWith(ALLOWED_DOMAIN)) {
        db.auth.signOut();
        setAuthError("Only @umt.ltd accounts are allowed.");
        setSession(null);
      } else {
        setSession(session);
      }
      setAuthLoading(false);
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_e, session) => {
      if (session && !session.user.email.endsWith(ALLOWED_DOMAIN)) {
        db.auth.signOut();
        setAuthError("Only @umt.ltd accounts are allowed.");
        setSession(null);
      } else {
        setSession(session);
        setAuthError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = () => {
    db.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  };
  const signOut = () => db.auth.signOut();

  // load from Supabase on mount (only when authenticated)
  useEffect(() => {
    if (!session) return;
    dbLoad().then(rows => {
      if (rows !== null) setProjects(rows);
      setLoading(false);
    });
  }, [session]);

  // apply theme + tweaks
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    document.documentElement.setAttribute("data-density", t.density);
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--display", `"${t.displayFont}", sans-serif`);
  }, [t.theme, t.density, t.accent, t.displayFont]);

  // dynamic tag list from real projects (exclude platform tags)
  const allTags = useMemo(() => {
    const EXCLUDE = new Set(["passenger", "driver"]);
    const seen = new Set();
    projects.forEach(p => p.tags?.forEach(t => { if (!EXCLUDE.has(t)) seen.add(t); }));
    return [...seen].sort();
  }, [projects]);

  // counts
  const counts = useMemo(() => {
    const c = { all: projects.length, ongoing: 0, shipped: 0, hold: 0, archived: 0, adhoc: 0, pinned: 0, passenger: 0, driver: 0 };
    projects.forEach(p => {
      c[p.status] = (c[p.status] || 0) + 1;
      if (p.tags?.includes("adhoc")) c.adhoc++;
      if (p.pinned) c.pinned++;
      if (p.tags?.includes("passenger")) c.passenger++;
      if (p.tags?.includes("driver")) c.driver++;
    });
    return c;
  }, [projects]);

  // filtered
  const filtered = useMemo(() => {
    let list = projects.slice();
    if (filter === "pinned") list = list.filter(p => p.pinned);
    else if (filter === "adhoc") list = list.filter(p => p.tags?.includes("adhoc"));
    else if (filter !== "all") list = list.filter(p => p.status === filter);
    if (platformFilter) list = list.filter(p => p.tags?.includes(platformFilter));
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
  }, [projects, filter, platformFilter, tagFilter, search, sort]);

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
  const isEmptyProject = (p) =>
    !p.title.trim() &&
    !p.desc.trim() &&
    !p.figma?.length && !p.proto?.length && !p.docs?.length &&
    !p.notes?.trim();

  const handleClose = () => {
    if (openProject && isEmptyProject(openProject)) {
      setProjects(prev => prev.filter(x => x.id !== openProject.id));
      dbDelete(openProject.id);
    }
    setOpenId(null);
  };

  const createProject = (team) => {
    const autoTeam = team || platformFilter; // use passed team or current sidebar filter
    const p = {
      id: "p-" + Math.random().toString(36).slice(2, 9),
      title: "",
      desc: "",
      status: "ongoing",
      priority: 0,
      tags: autoTeam ? [autoTeam] : [],
      cover: { kind: "stripes", c1: "oklch(0.78 0.10 252)", c2: "oklch(0.92 0.04 252)", angle: "55deg" },
      coverLabel: "",
      figma: [], proto: [], docs: [],
      stakeholders: [],
      updated: "Just now",
      started: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      notes: "",
      history: [{ date: "Today", text: "Project created" }],
      pinned: false,
    };
    setProjects(prev => [p, ...prev]);
    setOpenId(p.id);
    dbInsert(p);
  };
  const quickCapture = () => {
    if (!inboxText.trim()) return;
    const p = {
      id: "p-quick-" + Math.random().toString(36).slice(2, 7),
      title: inboxText.trim(),
      desc: "",
      status: "ongoing",
      priority: 0,
      tags: ["adhoc"],
      cover: { kind: "stripes", c1: "oklch(0.85 0.04 60)", c2: "oklch(0.93 0.02 60)", angle: "0deg" },
      coverLabel: "ADHOC",
      figma: [], proto: [], docs: [],
      stakeholders: [],
      updated: "Just now",
      started: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      notes: "", history: [{ date: "Today", text: "Captured via inbox" }],
      pinned: false,
    };
    setProjects(prev => [p, ...prev]);
    setOpenId(p.id);
    setInboxText("");
    dbInsert(p);
  };

  // keyboard shortcuts
  const searchRef = useRef();
  const createProjectRef = useRef(createProject);
  createProjectRef.current = createProject;
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") { e.preventDefault(); createProjectRef.current(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (authLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--sans)", color: "var(--ink-3)", fontSize: 14 }}>
      Loading…
    </div>
  );

  if (!session) return <LoginScreen onSignIn={signIn} error={authError} />;

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
          <NavItem icon="◆" label="All projects" count={counts.all} active={filter === "all" && !tagFilter && !platformFilter} onClick={() => { setFilter("all"); setTagFilter(null); setPlatformFilter(null); }} />
        </div>

        <div className="nav-group">
          <div className="nav-label">Platform</div>
          <NavItem dotColor="oklch(0.55 0.14 280)" label="Passenger" count={counts.passenger || 0} active={platformFilter === "passenger"} onClick={() => { setPlatformFilter(platformFilter === "passenger" ? null : "passenger"); setTagFilter(null); }} />
          <NavItem dotColor="oklch(0.55 0.14 155)" label="Driver"    count={counts.driver    || 0} active={platformFilter === "driver"}    onClick={() => { setPlatformFilter(platformFilter === "driver"    ? null : "driver");    setTagFilter(null); }} />
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
            {allTags.map(tag => (
              <button key={tag} className={`tag-pill ${tagFilter === tag ? "active" : ""}`}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", lineHeight: 1.6 }}>
            <div>⌘K — search</div>
            <div>⌘N — new project</div>
            <div>Esc — close drawer</div>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session.user.email}
            </div>
            <button onClick={signOut} style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}
              onMouseOver={e => e.currentTarget.style.color = "var(--ink)"}
              onMouseOut={e => e.currentTarget.style.color = "var(--ink-3)"}>
              Sign out
            </button>
          </div>
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
            <button className="primary-btn" onClick={() => createProject()}>
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
        projects={projects}
        onClose={handleClose}
        onUpdate={updateProject}
        onDelete={deleteProject}
        onDuplicate={duplicateProject}
      />

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
