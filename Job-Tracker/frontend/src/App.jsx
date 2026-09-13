import { useState, useMemo, useEffect } from "react";
import { AppProvider, useApp } from "./AppContext";
import Dashboard from "./views/Dashboard";
import Applications from "./views/Applications";
import Resume from "./views/Resume";
import Communications from "./views/Communications";

/* ─── Nav items ──────────────────────────────────────────── */
const NAV_ITEMS = [
  { view: "dashboard", label: "Dashboard", icon: "◈" },
  { view: "applications", label: "Applications", icon: "⊞" },
  { view: "resume", label: "Resume", icon: "◉" },
  { view: "communications", label: "Activity Log", icon: "◎" },
];

/* ─── Theme hook ─────────────────────────────────────────── */
function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("jt_theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("jt_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setThemeState((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  }

  return { theme, toggleTheme };
}

/* ─── Sidebar ────────────────────────────────────────────── */
function Sidebar({
  view,
  onNavigate,
  sidebarOpen,
  onClose,
  theme,
  onToggleTheme,
}) {
  const { applications } = useApp();

  const reminders = useMemo(() => {
    return applications.filter((application) => {
      if (!application.reminderDate) return false;

      const diff =
        new Date(`${application.reminderDate}T00:00:00`).getTime() -
        Date.now();

      return Math.ceil(diff / 86400000) <= 3;
    }).length;
  }, [applications]);

  const activeApps = applications.filter(
    (application) =>
      !["rejected", "withdrawn"].includes(application.status)
  ).length;

  const offers = applications.filter(
    (application) => application.status === "offer"
  ).length;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 flex flex-col
          bg-[var(--card)] border-r border-[var(--border)]
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative md:z-auto
        `}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
              JT
            </div>

            <div>
              <p className="font-display font-700 text-[var(--foreground)] leading-none">
                JobTrackr
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                your career dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Status chips */}
        <div className="px-4 py-3 border-b border-[var(--border)] flex flex-wrap gap-2">
          <span className="chip bg-[var(--secondary)] border border-[var(--border)] text-[var(--muted-foreground)] text-[10px]">
            {activeApps} active
          </span>

          {offers > 0 && (
            <span className="chip bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 text-[10px]">
              {offers} offer{offers > 1 ? "s" : ""} 🎉
            </span>
          )}

          {reminders > 0 && (
            <span className="chip bg-amber-900/40 border border-amber-700/40 text-amber-400 text-[10px]">
              {reminders} reminder{reminders > 1 ? "s" : ""} ⏰
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                onNavigate(item.view);
                onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                ${
                  view === item.view
                    ? "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                }
              `}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>

              {item.label}

              {item.view === "applications" && (
                <span className="ml-auto text-[11px] bg-[var(--secondary)] border border-[var(--border)] px-2 py-0.5 rounded-full text-[var(--muted-foreground)]">
                  {applications.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User + theme toggle */}
        <div className="px-4 py-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold shrink-0">
              JR
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">Test Guy</p>
              <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                testguy@gmail.com
              </p>
            </div>

            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors text-base shrink-0"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ─── Shell ──────────────────────────────────────────────── */
function Shell() {
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  function navigate(nextView) {
    setView(nextView);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar
        view={view}
        onNavigate={navigate}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
          >
            ☰
          </button>

          <span className="font-display font-700 text-sm">JobTrackr</span>

          <div className="w-9" />
        </div>

        {/* View */}
        <div className="flex-1 overflow-hidden">
          {view === "dashboard" && (
            <div className="h-full overflow-y-auto">
              <Dashboard onNavigate={navigate} />
            </div>
          )}

          {view === "applications" && <Applications />}
          {view === "resume" && <Resume />}
          {view === "communications" && <Communications />}
        </div>
      </div>
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────── */
export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
