import { useState } from "react";
import { useApp } from "../AppContext";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const SECTION_ICONS = {
  summary: "◎",
  experience: "⚡",
  education: "🎓",
  skills: "⚙",
  projects: "🔧",
  certifications: "🏆",
  custom: "✦",
};

const SECTION_TYPES = [
  { value: "summary", label: "Summary" },
  { value: "experience", label: "Experience" },
  { value: "education", label: "Education" },
  { value: "skills", label: "Skills" },
  { value: "projects", label: "Projects" },
  { value: "certifications", label: "Certifications" },
  { value: "custom", label: "Custom" },
];

function ContactField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
      />
    </div>
  );
}

function SectionEditor({ section, onSave, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState(section.content);
  const [title, setTitle] = useState(section.title);
  const [dirty, setDirty] = useState(false);

  function handleChange(val) {
    setContent(val);
    setDirty(true);
  }

  function handleTitleChange(val) {
    setTitle(val);
    setDirty(true);
  }

  function save() {
    onSave(section.id, content, title);
    setDirty(false);
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--secondary)] transition-colors group"
      >
        <span className="text-lg w-7 text-center">
          {SECTION_ICONS[section.type]}
        </span>

        <span className="font-medium text-sm flex-1">
          {section.title}
        </span>

        {dirty && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-700/30">
            Unsaved
          </span>
        )}

        <span
          className={`text-[var(--muted-foreground)] text-xs transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[var(--border)]">
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">
                Section title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">
                Content
              </label>

              <p className="text-[11px] text-[var(--muted-foreground)] mb-2">
                Use **bold** for emphasis. Separate entries with a blank line.
              </p>

              <textarea
                rows={Math.max(6, content.split("\n").length + 2)}
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none font-mono leading-relaxed"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                className="flex-1 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-purple-500 transition-colors"
              >
                Save section
              </button>

              <button
                onClick={() => onDelete(section.id)}
                className="px-5 py-2.5 rounded-full bg-rose-900/30 border border-rose-700/30 text-rose-400 text-sm hover:bg-rose-900/50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddSectionModal({ onAdd, onClose }) {
  const [type, setType] = useState("experience");
  const [title, setTitle] = useState("");

  function submit(e) {
    e.preventDefault();

    onAdd({
      id: `s-${uid()}`,
      type,
      title:
        title ||
        SECTION_TYPES.find((t) => t.value === type)?.label ||
        "Custom",
      content: "",
    });

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-80 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg font-700 mb-4">
          Add section
        </h3>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-[var(--muted-foreground)] block mb-1">
              Type
            </label>

            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setTitle("");
              }}
              className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              {SECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[var(--muted-foreground)] block mb-1">
              Custom title (optional)
            </label>

            <input
              type="text"
              placeholder={
                SECTION_TYPES.find((t) => t.value === type)?.label || "Custom"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-purple-500 transition-colors mt-1"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

function renderContent(text) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) {
      return <br key={i} />;
    }

    const parts = line.split(/(\*\*[^*]+\*\*)/g);

    return (
      <p key={i} className="leading-relaxed">
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={j}>{p.slice(2, -2)}</strong>
          ) : (
            p
          )
        )}
      </p>
    );
  });
}

export default function Resume() {
  const {
    resume,
    updateResume,
    updateResumeSection,
    applications,
  } = useApp();

  const [tab, setTab] = useState("editor");
  const [showAddSection, setShowAddSection] = useState(false);
  const [tailoredApp, setTailoredApp] = useState("");
  const [contactSaved, setContactSaved] = useState(false);
  const [contactDraft, setContactDraft] = useState(resume);

  const appsWithNotes = applications.filter(
    (a) => a.resumeCustomization.trim()
  );

  function saveContact() {
    updateResume({
      name: contactDraft.name,
      email: contactDraft.email,
      phone: contactDraft.phone,
      location: contactDraft.location,
      linkedin: contactDraft.linkedin,
      github: contactDraft.github,
      website: contactDraft.website,
    });

    setContactSaved(true);

    setTimeout(() => setContactSaved(false), 2000);
  }

  function saveSectionContent(id, content, title) {
    updateResumeSection(id, content);

    updateResume({
      sections: resume.sections.map((s) =>
        s.id === id
          ? {
              ...s,
              title,
              content,
            }
          : s
      ),
    });
  }

  function deleteSection(id) {
    updateResume({
      sections: resume.sections.filter((s) => s.id !== id),
    });
  }

  function addSection(s) {
    updateResume({
      sections: [...resume.sections, s],
    });
  }

  const selectedApp = applications.find((a) => a.id === tailoredApp);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 md:px-10 pt-8 pb-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-700">
              Master Resume
            </h1>

            <p className="text-[var(--muted-foreground)] text-sm mt-0.5">
              Edit once, tailor for each application
            </p>
          </div>

          <div className="flex rounded-full border border-[var(--border)] overflow-hidden">
            {["editor", "preview", "tailored"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-medium transition-colors capitalize ${
                  tab === t
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                }`}
              >
                {t === "tailored"
                  ? `Tailored (${appsWithNotes.length})`
                  : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {tab === "editor" && (
          <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 flex flex-col gap-6">
            {/* Contact */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                👤 Contact Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Phone", key: "phone" },
                  { label: "Location", key: "location" },
                  { label: "LinkedIn", key: "linkedin" },
                  { label: "GitHub", key: "github" },
                  { label: "Website / Portfolio", key: "website" },
                ].map(({ label, key }) => (
                  <ContactField
                    key={key}
                    label={label}
                    value={contactDraft[key] || ""}
                    onChange={(v) =>
                      setContactDraft((d) => ({
                        ...d,
                        [key]: v,
                      }))
                    }
                  />
                ))}
              </div>

              <button
                onClick={saveContact}
                className={`mt-4 px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  contactSaved
                    ? "bg-emerald-600 text-white"
                    : "bg-[var(--primary)] text-white hover:bg-purple-500"
                }`}
              >
                {contactSaved ? "✓ Saved!" : "Save contact info"}
              </button>
            </div>

            {/* Sections */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  Sections ({resume.sections.length})
                </h2>

                <button
                  onClick={() => setShowAddSection(true)}
                  className="text-xs px-4 py-1.5 rounded-full bg-[var(--primary)] text-white hover:bg-purple-500 transition-colors"
                >
                  + Add section
                </button>
              </div>

              {resume.sections.map((section) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  onSave={saveSectionContent}
                  onDelete={deleteSection}
                />
              ))}
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div className="max-w-3xl mx-auto px-6 md:px-10 py-8">
            {/* Preview pane styled like a resume */}
            <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl shadow-[var(--primary)]/10 border border-[var(--border)]">
              {/* Header */}
              <div className="px-10 py-8 bg-gray-50 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900">
                  {resume.name}
                </h1>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
                  {resume.email && <span>✉ {resume.email}</span>}
                  {resume.phone && <span>📞 {resume.phone}</span>}
                  {resume.location && <span>📍 {resume.location}</span>}
                  {resume.linkedin && <span>in {resume.linkedin}</span>}
                  {resume.github && <span>⌥ {resume.github}</span>}
                  {resume.website && <span>🌐 {resume.website}</span>}
                </div>
              </div>

              {/* Sections */}
              <div className="px-10 py-8 flex flex-col gap-6">
                {resume.sections.map((section) => (
                  <div key={section.id}>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-200">
                      {section.title}
                    </h2>

                    <div className="text-sm text-gray-700 flex flex-col gap-1">
                      {renderContent(section.content)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "tailored" && (
          <div className="max-w-5xl mx-auto px-6 md:px-10 py-8">
            {appsWithNotes.length === 0 ? (
              <div className="text-center py-20 text-[var(--muted-foreground)]">
                <p className="text-4xl mb-4">✏️</p>

                <p className="text-lg font-medium text-[var(--foreground)] mb-2">
                  No tailored versions yet
                </p>

                <p className="text-sm">
                  Open an application from the Applications view, go to the
                  Resume tab, and add customization notes.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Select an application to see its tailoring notes alongside
                    your master resume.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {appsWithNotes.map((app) => (
                      <button
                        key={app.id}
                        onClick={() =>
                          setTailoredApp(
                            tailoredApp === app.id ? "" : app.id
                          )
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          tailoredApp === app.id
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/40"
                        }`}
                      >
                        {app.company} – {app.position}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedApp && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Tailoring notes */}
                    <div className="bg-[var(--card)] border border-amber-700/30 rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 bg-amber-900/20 border-b border-amber-700/20">
                        <p className="text-sm font-semibold text-amber-300">
                          ✏️ Tailoring notes for {selectedApp.company}
                        </p>

                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          {selectedApp.position}
                        </p>
                      </div>

                      <div className="px-5 py-5">
                        <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                          {selectedApp.resumeCustomization}
                        </p>
                      </div>
                    </div>

                    {/* Master resume summary */}
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 bg-[var(--secondary)] border-b border-[var(--border)]">
                        <p className="text-sm font-semibold">
                          📄 Your master resume
                        </p>

                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          {resume.name}
                        </p>
                      </div>

                      <div className="px-5 py-5 flex flex-col gap-4 overflow-y-auto max-h-[500px]">
                        {resume.sections.map((s) => (
                          <div key={s.id}>
                            <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest mb-1.5">
                              {s.title}
                            </p>

                            <div className="text-xs text-[var(--foreground)]/80 leading-relaxed flex flex-col gap-0.5">
                              {renderContent(s.content)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddSection && (
        <AddSectionModal
          onAdd={addSection}
          onClose={() => setShowAddSection(false)}
        />
      )}
    </div>
  );
}
