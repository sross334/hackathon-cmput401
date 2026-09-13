import { useState, useMemo } from "react";
import { useApp } from "../AppContext";

/* ─── Constants ──────────────────────────────────────────── */

const STATUSES = [
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

const STATUS_META = {
  wishlist: {
    label: "Wishlist",
    color: "text-slate-400",
    bg: "bg-slate-900/40",
    border: "border-slate-700/40",
    dot: "#64748b",
  },
  applied: {
    label: "Applied",
    color: "text-blue-300",
    bg: "bg-blue-900/40",
    border: "border-blue-700/40",
    dot: "#93c5fd",
  },
  phone_screen: {
    label: "Phone Screen",
    color: "text-cyan-300",
    bg: "bg-cyan-900/40",
    border: "border-cyan-700/40",
    dot: "#67e8f9",
  },
  interview: {
    label: "Interview",
    color: "text-amber-300",
    bg: "bg-amber-900/40",
    border: "border-amber-700/40",
    dot: "#fcd34d",
  },
  offer: {
    label: "Offer 🎉",
    color: "text-emerald-300",
    bg: "bg-emerald-900/40",
    border: "border-emerald-700/40",
    dot: "#6ee7b7",
  },
  rejected: {
    label: "Rejected",
    color: "text-rose-300",
    bg: "bg-rose-900/40",
    border: "border-rose-700/40",
    dot: "#fda4af",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "text-zinc-400",
    bg: "bg-zinc-900/40",
    border: "border-zinc-700/40",
    dot: "#a1a1aa",
  },
};

const COMM_TYPES = [
  { value: "email", label: "Email", icon: "✉" },
  { value: "call", label: "Call", icon: "📞" },
  { value: "interview", label: "Interview", icon: "🎙" },
  { value: "offer_received", label: "Offer received", icon: "🎉" },
  { value: "rejection", label: "Rejection", icon: "✕" },
  { value: "follow_up", label: "Follow-up sent", icon: "↩" },
  { value: "note", label: "Note", icon: "✏" },
];

const LOGO_COLORS = [
  "#7C5CFC",
  "#FF5F57",
  "#0071E3",
  "#00B37E",
  "#FF9500",
  "#FF3B30",
  "#5856D6",
  "#34C759",
  "#FF2D55",
  "#007AFF",
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatDate(d) {
  if (!d) return "";

  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysAgo(d) {
  const diff =
    Date.now() - new Date(d + "T00:00:00").getTime();

  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";

  return `${days}d ago`;
}

/* ─── Empty application form ─────────────────────────────── */

function emptyApp() {
  return {
    company: "",
    position: "",
    url: "",
    location: "",
    salary: "",
    dateApplied: new Date().toISOString().slice(0, 10),
    status: "applied",
    notes: "",
    reminderDate: "",
    reminderNote: "",
    resumeCustomization: "",
    tags: [],
    logoColor:
      LOGO_COLORS[Math.floor(Math.random() * LOGO_COLORS.length)],
  };
}

/* ─── Application Detail Drawer ──────────────────────────── */

function Drawer({ app, onClose }) {
  const {
    updateApplication,
    deleteApplication,
    setStatus,
    addCommunication,
    deleteCommunication,
  } = useApp();

  const [tab, setTab] = useState("details");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(app);

  const [newComm, setNewComm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "email",
    subject: "",
    body: "",
  });

  const [showCommForm, setShowCommForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function saveEdits() {
    updateApplication(app.id, draft);
    setEditing(false);
  }

  function submitComm(e) {
    e.preventDefault();

    if (!newComm.subject.trim()) return;

    addCommunication(app.id, newComm);

    setNewComm({
      date: new Date().toISOString().slice(0, 10),
      type: "email",
      subject: "",
      body: "",
    });

    setShowCommForm(false);
  }

  const meta = STATUS_META[app.status];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-full bg-[var(--card)] border-l border-[var(--border)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                style={{
                  backgroundColor: app.logoColor + "22",
                  border: `1.5px solid ${app.logoColor}44`,
                  color: app.logoColor,
                }}
              >
                {app.company[0]}
              </div>

              <div>
                <h2 className="font-display text-xl font-700">
                  {app.company}
                </h2>

                <p className="text-sm text-[var(--muted-foreground)]">
                  {app.position}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={app.status}
                onChange={(e) =>
                  setStatus(app.id, e.target.value)
                }
                className="text-xs px-3 py-1.5 rounded-full bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>

              <button
                onClick={onClose}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Sub-info */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-[var(--muted-foreground)]">
            {app.location && <span>📍 {app.location}</span>}
            {app.salary && <span>💰 {app.salary}</span>}

            <span>
              📅 Applied {formatDate(app.dateApplied)}
            </span>

            {app.url && (
              <a
                href={app.url}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--primary)] hover:underline"
              >
                🔗 Job posting
              </a>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {["details", "resume", "comms"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                  tab === t
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                }`}
              >
                {t === "comms"
                  ? `Comms (${app.communications.length})`
                  : t === "resume"
                  ? "Resume"
                  : "Details"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {tab === "details" && (
            <div className="flex flex-col gap-5">
              {editing ? (
                <>
                  {[
                    {
                      label: "Company",
                      key: "company",
                      type: "text",
                    },
                    {
                      label: "Position",
                      key: "position",
                      type: "text",
                    },
                    {
                      label: "Location",
                      key: "location",
                      type: "text",
                    },
                    {
                      label: "Salary",
                      key: "salary",
                      type: "text",
                    },
                    {
                      label: "Job URL",
                      key: "url",
                      type: "url",
                    },
                    {
                      label: "Date Applied",
                      key: "dateApplied",
                      type: "date",
                    },
                    {
                      label: "Reminder Date",
                      key: "reminderDate",
                      type: "date",
                    },
                    {
                      label: "Reminder Note",
                      key: "reminderNote",
                      type: "text",
                    },
                  ].map(({ label, key, type }) => (
                    <div
                      key={key}
                      className="flex flex-col gap-1.5"
                    >
                      <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        {label}
                      </label>

                      <input
                        type={type}
                        value={draft[key] || ""}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            [key]: e.target.value,
                          }))
                        }
                        className="bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                      Notes
                    </label>

                    <textarea
                      rows={4}
                      value={draft.notes}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          notes: e.target.value,
                        }))
                      }
                      className="bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveEdits}
                      className="flex-1 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => {
                        setDraft(app);
                        setEditing(false);
                      }}
                      className="flex-1 py-2.5 rounded-full bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] text-sm hover:border-[var(--primary)]/40 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {app.notes && (
                    <div>
                      <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                        Notes
                      </p>

                      <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                        {app.notes}
                      </p>
                    </div>
                  )}

                  {app.reminderDate && (
                    <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/30">
                      <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">
                        ⏰ Reminder
                      </p>

                      <p className="text-sm text-[var(--foreground)]">
                        {app.reminderNote || "Follow up"}
                      </p>

                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {formatDate(app.reminderDate)}
                      </p>
                    </div>
                  )}

                  {app.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                        Tags
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {app.tags.map((t) => (
                          <span
                            key={t}
                            className="chip bg-[var(--secondary)] text-[var(--muted-foreground)] border border-[var(--border)] text-[11px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex-1 py-2.5 rounded-full bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] text-sm hover:border-[var(--primary)]/40 transition-colors"
                    >
                      Edit details
                    </button>

                    {confirmDelete ? (
                      <div className="flex gap-2 flex-1">
                        <button
                          onClick={() => {
                            deleteApplication(app.id);
                            onClose();
                          }}
                          className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-sm font-semibold"
                        >
                          Delete
                        </button>

                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 py-2.5 rounded-full bg-[var(--secondary)] border border-[var(--border)] text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="px-5 py-2.5 rounded-full bg-rose-900/30 border border-rose-700/30 text-rose-400 text-sm hover:bg-rose-900/50 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Resume tab */}
          {tab === "resume" && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                  Tailoring notes for this role
                </p>

                <p className="text-xs text-[var(--muted-foreground)] mb-3">
                  Note what to emphasize, add, or remove from your
                  master resume for this specific application.
                </p>

                <textarea
                  rows={6}
                  placeholder="e.g. Emphasize TypeScript and React performance work. Add the dashboard rebuild metrics (40% load time improvement). Remove older Java projects..."
                  value={draft.resumeCustomization}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      resumeCustomization: e.target.value,
                    }))
                  }
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                />

                <button
                  onClick={() =>
                    updateApplication(app.id, {
                      resumeCustomization:
                        draft.resumeCustomization,
                    })
                  }
                  className="mt-3 px-5 py-2 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-purple-500 transition-colors"
                >
                  Save notes
                </button>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Access your master resume under the{" "}
                  <strong className="text-[var(--foreground)]">
                    Resume
                  </strong>{" "}
                  tab in the sidebar to make deeper edits.
                </p>
              </div>
            </div>
          )}

          {/* Communications tab */}
          {tab === "comms" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {app.communications.length} communication
                  {app.communications.length !== 1 ? "s" : ""}
                </p>

                <button
                  onClick={() =>
                    setShowCommForm((v) => !v)
                  }
                  className="text-xs px-4 py-1.5 rounded-full bg-[var(--primary)] text-white hover:bg-purple-500 transition-colors"
                >
                  + Log entry
                </button>
              </div>

              {showCommForm && (
                <form
                  onSubmit={submitComm}
                  className="p-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] flex flex-col gap-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[var(--muted-foreground)] block mb-1">
                        Type
                      </label>

                      <select
                        value={newComm.type}
                        onChange={(e) =>
                          setNewComm((c) => ({
                            ...c,
                            type: e.target.value,
                          }))
                        }
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      >
                        {COMM_TYPES.map((t) => (
                          <option
                            key={t.value}
                            value={t.value}
                          >
                            {t.icon} {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-[var(--muted-foreground)] block mb-1">
                        Date
                      </label>

                      <input
                        type="date"
                        value={newComm.date}
                        onChange={(e) =>
                          setNewComm((c) => ({
                            ...c,
                            date: e.target.value,
                          }))
                        }
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[var(--muted-foreground)] block mb-1">
                      Subject
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="e.g. Recruiter screen with Jamie Torres"
                      value={newComm.subject}
                      onChange={(e) =>
                        setNewComm((c) => ({
                          ...c,
                          subject: e.target.value,
                        }))
                      }
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[var(--muted-foreground)] block mb-1">
                      Notes
                    </label>

                    <textarea
                      rows={3}
                      placeholder="Key details, next steps, names..."
                      value={newComm.body}
                      onChange={(e) =>
                        setNewComm((c) => ({
                          ...c,
                          body: e.target.value,
                        }))
                      }
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-purple-500 transition-colors"
                    >
                      Log it
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowCommForm(false)
                      }
                      className="flex-1 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-sm hover:border-[var(--primary)]/40 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {app.communications.length === 0 ? (
                <div className="text-center py-10 text-[var(--muted-foreground)] text-sm">
                  <p className="text-3xl mb-3">📭</p>
                  No communications logged yet.
                  <br />
                  Click "Log entry" to add one.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {[...app.communications]
                    .sort((a, b) =>
                      b.date.localeCompare(a.date)
                    )
                    .map((c) => {
                      const meta = COMM_TYPES.find(
                        (t) => t.value === c.type
                      );

                      return (
                        <div
                          key={c.id}
                          className="p-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)] group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-sm shrink-0">
                                {meta?.icon}
                              </span>

                              <div className="min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-sm font-medium">
                                    {c.subject}
                                  </p>
                                </div>

                                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                  {meta?.label} ·{" "}
                                  {formatDate(c.date)}
                                </p>

                                {c.body && (
                                  <p className="text-xs text-[var(--foreground)]/70 mt-2 leading-relaxed">
                                    {c.body}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                deleteCommunication(
                                  app.id,
                                  c.id
                                )
                              }
                              className="text-[var(--muted-foreground)] hover:text-rose-400 transition-colors text-lg leading-none shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Add Application Modal ──────────────────────────────── */

function AddModal({ onClose }) {
  const { addApplication } = useApp();

  const [form, setForm] = useState(emptyApp());
  const [tagInput, setTagInput] = useState("");

  function submit(e) {
    e.preventDefault();
    addApplication(form);
    onClose();
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();

    if (t && !form.tags.includes(t)) {
      setForm((f) => ({
        ...f,
        tags: [...f.tags, t],
      }));
    }

    setTagInput("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-display text-xl font-700">
            Add application
          </h2>

          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xl"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={submit}
          className="px-6 py-5 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Company *",
                key: "company",
                type: "text",
                placeholder: "Stripe",
                required: true,
              },
              {
                label: "Position *",
                key: "position",
                type: "text",
                placeholder: "Senior Engineer",
                required: true,
              },
              {
                label: "Location",
                key: "location",
                type: "text",
                placeholder: "San Francisco, CA",
              },
              {
                label: "Salary range",
                key: "salary",
                type: "text",
                placeholder: "$150k – $200k",
              },
            ].map(
              ({
                label,
                key,
                type,
                placeholder,
                required,
              }) => (
                <div
                  key={key}
                  className="flex flex-col gap-1.5"
                >
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">
                    {label}
                  </label>

                  <input
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    value={form[key] || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        [key]: e.target.value,
                      }))
                    }
                    className="bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              )
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">
              Job URL
            </label>

            <input
              type="url"
              placeholder="https://company.com/jobs/role"
              value={form.url}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  url: e.target.value,
                }))
              }
              className="bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">
                Date applied
              </label>

              <input
                type="date"
                value={form.dateApplied}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dateApplied: e.target.value,
                  }))
                }
                className="bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value,
                  }))
                }
                className="bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">
              Notes
            </label>

            <textarea
              rows={3}
              placeholder="Key details about this role, referral info, what to research..."
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  notes: e.target.value,
                }))
              }
              className="bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">
              Tags
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />

              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)] text-sm hover:border-[var(--primary)]/40 transition-colors"
              >
                +
              </button>
            </div>

            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="chip bg-[var(--secondary)] border border-[var(--border)] text-[var(--muted-foreground)] text-[11px] gap-1.5"
                  >
                    {t}

                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          tags: f.tags.filter(
                            (x) => x !== t
                          ),
                        }))
                      }
                      className="hover:text-rose-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Logo color picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">
              Accent color
            </label>

            <div className="flex gap-2">
              {LOGO_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      logoColor: c,
                    }))
                  }
                  className="w-6 h-6 rounded-full transition-all"
                  style={{
                    backgroundColor: c,
                    outline:
                      form.logoColor === c
                        ? `2px solid ${c}`
                        : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[var(--primary)] text-white font-semibold hover:bg-purple-500 transition-colors mt-1"
          >
            Add application
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Kanban column ──────────────────────────────────────── */

function KanbanColumn({ status, apps, onSelect }) {
  const meta = STATUS_META[status];
  const { setStatus } = useApp();

  function handleDrop(e) {
    const id = e.dataTransfer.getData("appId");

    if (id) {
      setStatus(id, status);
    }
  }

  return (
    <div
      className="flex flex-col min-w-[260px] max-w-[260px]"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: meta.dot }}
        />

        <span
          className={`text-xs font-semibold ${meta.color}`}
        >
          {meta.label}
        </span>

        <span className="text-xs text-[var(--muted-foreground)] ml-auto">
          {apps.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-h-[120px]">
        {apps.map((app) => (
          <div
            key={app.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("appId", app.id);
            }}
            onClick={() => onSelect(app)}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3.5 cursor-pointer hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all group active:scale-95"
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  backgroundColor: app.logoColor + "22",
                  border: `1px solid ${app.logoColor}44`,
                  color: app.logoColor,
                }}
              >
                {app.company[0]}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold truncate group-hover:text-[var(--primary)] transition-colors">
                  {app.company}
                </p>

                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {app.position}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--muted-foreground)]">
                {daysAgo(app.dateApplied)}
              </span>

              <div className="flex items-center gap-1.5">
                {app.reminderDate && (
                  <span
                    title="Has reminder"
                    className="text-amber-400 text-[11px]"
                  >
                    ⏰
                  </span>
                )}

                {app.communications.length > 0 && (
                  <span className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-0.5">
                    <span className="text-[10px]">✉</span>{" "}
                    {app.communications.length}
                  </span>
                )}

                {app.salary && (
                  <span className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[80px]">
                    {app.salary.split("–")[0].trim()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Applications view ──────────────────────────────────── */

export default function Applications() {
  const { applications } = useApp();

  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("kanban");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return applications.filter(
      (a) =>
        !q ||
        a.company.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q))
    );
  }, [applications, search]);

  const byStatus = useMemo(() => {
    const map = {};

    for (const s of STATUSES) {
      map[s] = filtered.filter((a) => a.status === s);
    }

    return map;
  }, [filtered]);

  // Keep drawer in sync with live data
  const liveSelected = selected
    ? applications.find((a) => a.id === selected.id) || selected
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 md:px-10 pt-8 pb-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3 shrink-0">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-700">
            Applications
          </h1>

          <p className="text-[var(--muted-foreground)] text-sm mt-0.5">
            {applications.length} total ·{" "}
            {
              applications.filter(
                (a) =>
                  !["rejected", "withdrawn"].includes(
                    a.status
                  )
              ).length
            }{" "}
            active
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-full text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors w-44"
            />
          </div>

          <div className="flex rounded-full border border-[var(--border)] overflow-hidden">
            {["kanban", "list"].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-4 py-2 text-xs font-medium transition-colors capitalize ${
                  viewMode === m
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-2 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Kanban */}
      {viewMode === "kanban" && (
        <div className="flex-1 overflow-x-auto overflow-y-auto px-6 md:px-10 py-6">
          <div
            className="flex gap-4 pb-6"
            style={{ minWidth: "max-content" }}
          >
            {STATUSES.map((s) => (
              <KanbanColumn
                key={s}
                status={s}
                apps={byStatus[s] || []}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
          <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-[var(--muted-foreground)] text-sm">
                No applications found.
              </div>
            ) : (
              filtered.map((app) => {
                const meta = STATUS_META[app.status];

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelected(app)}
                    className="flex items-center gap-4 px-5 py-4 bg-[var(--card)] hover:bg-[var(--secondary)] cursor-pointer group transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        backgroundColor:
                          app.logoColor + "22",
                        border: `1px solid ${app.logoColor}44`,
                        color: app.logoColor,
                      }}
                    >
                      {app.company[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-[var(--primary)] transition-colors">
                        {app.company}
                      </p>

                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {app.position}
                      </p>
                    </div>

                    {app.location && (
                      <span className="text-xs text-[var(--muted-foreground)] hidden md:block">
                        {app.location}
                      </span>
                    )}

                    {app.salary && (
                      <span className="text-xs text-[var(--muted-foreground)] hidden lg:block">
                        {app.salary}
                      </span>
                    )}

                    <span className="text-xs text-[var(--muted-foreground)]">
                      {formatDate(app.dateApplied)}
                    </span>

                    <span
                      className={`chip text-[11px] ${meta.bg} ${meta.color} ${meta.border}`}
                    >
                      {meta.label}
                    </span>

                    {app.reminderDate && (
                      <span className="text-amber-400 text-xs">
                        ⏰
                      </span>
                    )}

                    <span className="text-[var(--primary)] group-hover:translate-x-0.5 transition-transform text-sm">
                      →
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {liveSelected && (
        <Drawer
          app={liveSelected}
          onClose={() => setSelected(null)}
        />
      )}

      {showAdd && (
        <AddModal onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}
