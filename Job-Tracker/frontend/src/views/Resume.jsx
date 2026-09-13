import { useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { downloadResumePdf, downloadResumeWord, readWordTemplate } from "./ResumeExport";

const STORE_KEY = "jt_resume_workspace_v2";
const TEMPLATE_KEY = "jt_resume_template_v1";

const sampleMaster = {
    name: "Alex Morgan", email: "alex.morgan@example.com", phone: "(555) 123-4567",
    location: "Denver, CO", linkedin: "linkedin.com/in/alexmorgan",
    github: "github.com/alexmorgan", website: "alexmorgan.dev",
    sections: [
        {
            id: "profile", type: "summary", title: "Profile", points: [
                "Computer science student building thoughtful web experiences with React and Python.",
                "Experienced with accessible interfaces, API integration, and collaborative product work.",
            ]
        },
        {
            id: "experience", type: "experience", title: "Experience", items: [
                {
                    id: "northstar", role: "Frontend Developer Intern", company: "Northstar Studio", dates: "May 2026 – August 2026", bullets: [
                        "Built reusable React components for a customer support dashboard.",
                        "Connected frontend components to REST APIs with clear loading and error states.",
                        "Created keyboard-accessible forms and tested responsive layouts on mobile devices.",
                    ]
                },
                {
                    id: "tracker", role: "Full Stack Developer · Team Project", company: "Application Tracker", dates: "January 2026 – April 2026", bullets: [
                        "Built a job application tracker with a React frontend and Django backend.",
                        "Created reusable form components and implemented client-side validation.",
                        "Collaborated with three teammates using Git branches and pull requests.",
                    ]
                },
                {
                    id: "summit", role: "Customer Service Associate", company: "Summit Books", dates: "June 2024 – December 2025", bullets: [
                        "Helped customers find products and resolved order issues.",
                        "Trained two new team members on store procedures.",
                    ]
                },
            ]
        },
        { id: "skills", type: "skills", title: "Skills", points: ["React", "JavaScript", "Python", "Django", "REST APIs", "Git", "Figma", "SQL"] },
        { id: "education", type: "education", title: "Education", points: ["B.S. Computer Science · University of Colorado Denver · Expected May 2027"] },
    ],
};

const uid = () => globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
const clone = (value) => JSON.parse(JSON.stringify(value));

function readLocal(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
}

function move(list, index, offset) {
    const target = index + offset;
    if (target < 0 || target >= list.length) return list;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

function contactLine(resume) {
    return [resume.email, resume.phone, resume.location, resume.linkedin, resume.github, resume.website].filter(Boolean).join(" · ");
}

function ResumePreview({ resume }) {
    return (
        <article className="bg-white text-slate-800 min-h-[680px] rounded-xl p-7 md:p-10 shadow-xl shadow-black/20">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{resume.name || "Your name"}</h2>
            <p className="text-xs text-slate-500 mt-2 break-words">{contactLine(resume)}</p>
            <div className="mt-7 flex flex-col gap-6">
                {(resume.sections || []).map((section) => {
                    const points = (section.points || []).filter(Boolean);
                    const items = (section.items || []).filter((item) => (item.bullets || []).some(Boolean));
                    if (!points.length && !items.length) return null;
                    return (
                        <section key={section.id}>
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 border-b border-slate-200 pb-1.5 mb-3">{section.title}</h3>
                            {section.type === "experience" ? (
                                <div className="flex flex-col gap-4">{items.map((item) => (
                                    <div key={item.id}>
                                        <div className="flex flex-wrap justify-between gap-2">
                                            <h4 className="text-sm font-bold text-slate-900">{item.role}{item.company ? ` · ${item.company}` : ""}</h4>
                                            <span className="text-xs text-slate-500">{item.dates}</span>
                                        </div>
                                        <ul className="list-disc pl-5 mt-1.5 text-sm leading-relaxed">{item.bullets.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>
                                    </div>
                                ))}</div>
                            ) : section.type === "skills" ? (
                                <p className="text-sm leading-relaxed">{points.join(" · ")}</p>
                            ) : (
                                <ul className="list-disc pl-5 text-sm leading-relaxed">{points.map((point, index) => <li key={index}>{point}</li>)}</ul>
                            )}
                        </section>
                    );
                })}
            </div>
        </article>
    );
}

function TextField({ label, value, onChange, multiline = false }) {
    const classes = "w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]";
    return (
        <label className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">{label}</span>
            {multiline ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={`${classes} resize-y`} /> : <input value={value} onChange={(e) => onChange(e.target.value)} className={classes} />}
        </label>
    );
}

function PointEditor({ points, onChange }) {
    return (
        <div className="flex flex-col gap-2">
            {points.map((point, index) => (
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-start" key={index}>
                    <textarea rows={2} value={point} onChange={(e) => onChange(points.map((entry, position) => position === index ? e.target.value : entry))} className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm leading-relaxed resize-y focus:outline-none focus:border-[var(--primary)]" />
                    <div className="flex flex-col gap-1">
                        <button disabled={index === 0} onClick={() => onChange(move(points, index, -1))} className="w-8 h-8 rounded-lg border border-[var(--border)] disabled:opacity-30">↑</button>
                        <button disabled={index === points.length - 1} onClick={() => onChange(move(points, index, 1))} className="w-8 h-8 rounded-lg border border-[var(--border)] disabled:opacity-30">↓</button>
                        <button onClick={() => onChange(points.filter((_, position) => position !== index))} className="w-8 h-8 rounded-lg border border-rose-700/40 text-rose-400">×</button>
                    </div>
                </div>
            ))}
            <button onClick={() => onChange([...points, ""])} className="self-start text-xs px-3 py-1.5 rounded-full border border-[var(--border)]">+ Add point</button>
        </div>
    );
}

function MasterEditor({ master, setMaster, template, setTemplate, onSave, onStartTailoring }) {
    const [newSectionType, setNewSectionType] = useState("");
    const updateSection = (id, changes) => setMaster((current) => ({ ...current, sections: current.sections.map((section) => section.id === id ? { ...section, ...changes } : section) }));

    async function uploadTemplate(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const next = await readWordTemplate(file);
            localStorage.setItem(TEMPLATE_KEY, JSON.stringify(next));
            setTemplate(next);
        } catch (error) { alert(error.message); }
        finally { event.target.value = ""; }
    }

    function addSection() {
        if (!newSectionType) return;
        const title = newSectionType === "custom" ? "New section" : newSectionType[0].toUpperCase() + newSectionType.slice(1);
        setMaster((current) => ({ ...current, sections: [...current.sections, { id: uid(), type: newSectionType, title, ...(newSectionType === "experience" ? { items: [] } : { points: [] }) }] }));
        setNewSectionType("");
    }

    return (
        <div className="grid xl:grid-cols-[minmax(360px,0.9fr)_minmax(480px,1.1fr)] gap-6 items-start">
            <div className="flex flex-col gap-5">
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                    <h2 className="font-semibold">Resume template</h2>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-4">Upload the Word template used by tailored downloads.</p>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] px-4 py-3 mb-3">
                        <span className="text-sm break-all">{template?.name || "Classic PDF"}</span><span className="text-[10px] uppercase tracking-wider text-[var(--primary)]">Default</span>
                    </div>
                    <input type="file" accept=".docx" onChange={uploadTemplate} className="w-full text-xs file:mr-3 file:border-0 file:rounded-full file:px-3 file:py-2 file:bg-[var(--primary)] file:text-white" />
                    <a href="/resume-template-sample.docx" download className="inline-block text-xs text-[var(--primary)] mt-3 hover:underline">Download sample template</a>
                    {template && <button onClick={() => { localStorage.removeItem(TEMPLATE_KEY); setTemplate(null); }} className="text-xs text-[var(--muted-foreground)] mt-3">Use Classic PDF instead</button>}
                </section>

                <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4">
                    <div className="grid sm:grid-cols-2 gap-3">{["name", "email", "phone", "location", "linkedin", "github", "website"].map((key) => (
                        <TextField key={key} label={key === "name" ? "Full name" : key} value={master[key] || ""} onChange={(value) => setMaster((current) => ({ ...current, [key]: value }))} />
                    ))}</div>

                    {master.sections.map((section, sectionIndex) => (
                        <div key={section.id} className="border border-[var(--border)] rounded-xl p-4">
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-center mb-4">
                                <input value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} className="min-w-0 bg-transparent font-semibold focus:outline-none border-b border-transparent focus:border-[var(--primary)] py-1" />
                                <div className="flex gap-1">
                                    <button disabled={sectionIndex === 0} onClick={() => setMaster((current) => ({ ...current, sections: move(current.sections, sectionIndex, -1) }))} className="w-8 h-8 rounded-lg border border-[var(--border)] disabled:opacity-30">↑</button>
                                    <button disabled={sectionIndex === master.sections.length - 1} onClick={() => setMaster((current) => ({ ...current, sections: move(current.sections, sectionIndex, 1) }))} className="w-8 h-8 rounded-lg border border-[var(--border)] disabled:opacity-30">↓</button>
                                    <button onClick={() => setMaster((current) => ({ ...current, sections: current.sections.filter((item) => item.id !== section.id) }))} className="w-8 h-8 rounded-lg border border-rose-700/40 text-rose-400">×</button>
                                </div>
                            </div>

                            {section.type === "experience" ? (
                                <div className="flex flex-col gap-3">
                                    {(section.items || []).map((item, itemIndex) => (
                                        <details key={item.id} className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-3">
                                            <summary className="cursor-pointer text-sm font-medium">{item.role || "New experience"}{item.company ? ` · ${item.company}` : ""}</summary>
                                            <div className="mt-4 flex flex-col gap-3">
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    <TextField label="Role" value={item.role} onChange={(value) => updateSection(section.id, { items: section.items.map((entry) => entry.id === item.id ? { ...entry, role: value } : entry) })} />
                                                    <TextField label="Company" value={item.company} onChange={(value) => updateSection(section.id, { items: section.items.map((entry) => entry.id === item.id ? { ...entry, company: value } : entry) })} />
                                                </div>
                                                <TextField label="Dates" value={item.dates} onChange={(value) => updateSection(section.id, { items: section.items.map((entry) => entry.id === item.id ? { ...entry, dates: value } : entry) })} />
                                                <PointEditor points={item.bullets || []} onChange={(bullets) => updateSection(section.id, { items: section.items.map((entry) => entry.id === item.id ? { ...entry, bullets } : entry) })} />
                                                <div className="flex flex-wrap gap-2">
                                                    <button disabled={itemIndex === 0} onClick={() => updateSection(section.id, { items: move(section.items, itemIndex, -1) })} className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] disabled:opacity-30">Move role up</button>
                                                    <button disabled={itemIndex === section.items.length - 1} onClick={() => updateSection(section.id, { items: move(section.items, itemIndex, 1) })} className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] disabled:opacity-30">Move role down</button>
                                                    <button onClick={() => updateSection(section.id, { items: section.items.filter((entry) => entry.id !== item.id) })} className="text-xs px-3 py-1.5 rounded-full text-rose-400 border border-rose-700/40">Remove experience</button>
                                                </div>
                                            </div>
                                        </details>
                                    ))}
                                    <button onClick={() => updateSection(section.id, { items: [...(section.items || []), { id: uid(), role: "", company: "", dates: "", bullets: [] }] })} className="self-start text-xs px-3 py-1.5 rounded-full border border-[var(--border)]">+ Add experience</button>
                                </div>
                            ) : <PointEditor points={section.points || []} onChange={(points) => updateSection(section.id, { points })} />}
                        </div>
                    ))}

                    <div className="flex gap-2">
                        <select value={newSectionType} onChange={(e) => setNewSectionType(e.target.value)} className="flex-1 min-w-0 bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm">
                            <option value="">Choose a section…</option><option value="summary">Summary</option><option value="experience">Experience</option><option value="skills">Skills</option><option value="education">Education</option><option value="projects">Projects</option><option value="certifications">Certifications</option><option value="custom">Custom section</option>
                        </select>
                        <button disabled={!newSectionType} onClick={addSection} className="px-4 py-2 rounded-full bg-[var(--primary)] text-white disabled:opacity-40">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <button onClick={onSave} className="px-5 py-2.5 rounded-full border border-[var(--border)]">Save master</button>
                        <button onClick={onStartTailoring} className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-white">Start tailoring →</button>
                    </div>
                </section>
            </div>
            <div className="xl:sticky xl:top-6"><h2 className="font-semibold mb-3">Master preview</h2><ResumePreview resume={master} /></div>
        </div>
    );
}

function keywords(value) {
    return new Set((value.toLowerCase().match(/[a-z][a-z+#.]{2,}/g) || []).filter((word) => !["and", "the", "with", "for", "you", "will", "are", "this", "from"].includes(word)));
}

function recommend(master, job) {
    const wanted = keywords(`${job.role} ${job.description}`);
    const experience = master.sections.find((section) => section.type === "experience");
    return (experience?.items || []).map((item) => {
        const text = `${item.role} ${item.company} ${item.bullets.join(" ")}`.toLowerCase();
        const matches = [...wanted].filter((word) => text.includes(word));
        const matching = item.bullets.map((bullet, index) => ({ index, score: [...wanted].filter((word) => bullet.toLowerCase().includes(word)).length })).filter((entry) => entry.score).sort((a, b) => b.score - a.score);
        return { item, matches, matching, score: matches.length + matching.reduce((sum, entry) => sum + entry.score, 0) };
    }).sort((a, b) => b.score - a.score);
}

function tailoredResume(master, selected, edits) {
    const result = clone(master);
    result.sections = result.sections.map((section) => section.type !== "experience" ? section : {
        ...section,
        items: section.items.map((item) => ({ ...item, bullets: item.bullets.map((bullet, index) => edits[`${item.id}:${index}`] || bullet).filter((_, index) => selected.includes(`${item.id}:${index}`)) })).filter((item) => item.bullets.length),
    });
    return result;
}

function TailorResume({ master, applications, draft, setDraft, onSave, template }) {
    const [wording, setWording] = useState(false);
    const ranked = useMemo(() => recommend(master, draft.job), [master, draft.job]);
    const preview = tailoredResume(master, draft.selected, draft.edits);
    const updateJob = (key, value) => setDraft((current) => {
        const job = { ...current.job, [key]: value };
        return { ...current, job, title: current.customTitle ? current.title : `${job.role}${job.company ? ` — ${job.company}` : ""}` };
    });
    const chooseApplication = (id) => {
        const application = applications.find((entry) => String(entry.id) === id);
        if (!application) return;
        setDraft((current) => ({ ...current, applicationId: id, title: `${application.position} — ${application.company}`, customTitle: false, job: { role: application.position || "", company: application.company || "", description: [application.notes, application.resumeCustomization, application.resume_customization].filter(Boolean).join("\n") } }));
    };
    const toggle = (ids, include) => setDraft((current) => ({ ...current, selected: include ? [...new Set([...current.selected, ...ids])] : current.selected.filter((id) => !ids.includes(id)), edits: include ? current.edits : Object.fromEntries(Object.entries(current.edits).filter(([id]) => !ids.includes(id))) }));
    const suggestion = (text) => text.replace(/^Built /i, "Developed ").replace(/^Helped /i, "Supported ").replace(/^Worked on /i, "Contributed to ").replace(/^Created /i, "Produced ");

    return (
        <div className="grid xl:grid-cols-[minmax(340px,0.9fr)_minmax(480px,1.1fr)] gap-6 items-start">
            <div className="flex flex-col gap-4">
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-3">
                    {applications.length > 0 && <label className="flex flex-col gap-1.5"><span className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">Use an application</span><select value={draft.applicationId || ""} onChange={(e) => chooseApplication(e.target.value)} className="bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm"><option value="">Choose an application…</option>{applications.map((application) => <option key={application.id} value={String(application.id)}>{application.company} — {application.position}</option>)}</select></label>}
                    <div className="grid sm:grid-cols-2 gap-3"><TextField label="Role" value={draft.job.role} onChange={(value) => updateJob("role", value)} /><TextField label="Company" value={draft.job.company} onChange={(value) => updateJob("company", value)} /></div>
                    <TextField multiline label="Job description" value={draft.job.description} onChange={(value) => updateJob("description", value)} />
                </section>
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                    <div className="flex justify-between items-center gap-3 border-b border-[var(--border)] pb-4 mb-2"><div className="flex gap-2"><button onClick={() => setWording(false)} className={`px-3 py-1.5 rounded-full text-xs ${!wording ? "bg-[var(--primary)] text-white" : "text-[var(--muted-foreground)]"}`}>Experience</button><button onClick={() => setWording(true)} className={`px-3 py-1.5 rounded-full text-xs ${wording ? "bg-[var(--primary)] text-white" : "text-[var(--muted-foreground)]"}`}>Wording edits</button></div><span className="text-[10px] text-[var(--muted-foreground)]">Demo recommendations</span></div>
                    {!wording ? ranked.map(({ item, matches, matching }) => {
                        const ids = item.bullets.map((_, index) => `${item.id}:${index}`);
                        const selectedCount = ids.filter((id) => draft.selected.includes(id)).length;
                        const recommendedIds = matching.length ? matching.slice(0, 3).map((entry) => `${item.id}:${entry.index}`) : ids;
                        return <div key={item.id} className="py-4 border-b border-[var(--border)] last:border-0"><div className="flex justify-between gap-3"><div><h3 className="text-sm font-semibold">{item.role}</h3><p className="text-xs text-[var(--muted-foreground)]">{item.company}</p></div><button onClick={() => toggle(selectedCount ? ids : recommendedIds, !selectedCount)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs border ${selectedCount ? "border-[var(--border)]" : "bg-[var(--primary)] text-white border-[var(--primary)]"}`}>{selectedCount ? `✓ ${selectedCount} added` : "+ Add"}</button></div>{matches.length ? <p className="text-[11px] text-emerald-400 mt-2">Recommended · {matches.slice(0, 4).join(" · ")}</p> : <p className="text-[11px] text-[var(--muted-foreground)] mt-2">Optional · no direct keyword match</p>}<details className="mt-3"><summary className="text-xs cursor-pointer text-[var(--muted-foreground)]">Choose individual points</summary><div className="mt-3 flex flex-col gap-2">{item.bullets.map((bullet, index) => { const id = `${item.id}:${index}`; return <label key={id} className="flex gap-2 text-xs leading-relaxed"><input type="checkbox" checked={draft.selected.includes(id)} onChange={(e) => toggle([id], e.target.checked)} className="accent-[var(--primary)] mt-0.5" /><span>{bullet}</span></label>; })}</div></details></div>;
                    }) : <div>{ranked.flatMap(({ item }) => item.bullets.map((bullet, index) => ({ item, bullet, id: `${item.id}:${index}` }))).filter(({ id }) => draft.selected.includes(id)).map(({ item, bullet, id }) => { const proposed = suggestion(bullet); return <div key={id} className="py-4 border-b border-[var(--border)] last:border-0"><p className="text-[11px] text-[var(--muted-foreground)]">{item.role}</p><p className="text-sm mt-1 leading-relaxed">{draft.edits[id] || proposed}</p>{proposed === bullet ? <p className="text-[11px] text-[var(--muted-foreground)] mt-2">No preset wording change available.</p> : <div className="flex gap-2 mt-3"><button onClick={() => setDraft((current) => ({ ...current, edits: { ...current.edits, [id]: proposed } }))} className="px-3 py-1.5 rounded-full bg-[var(--primary)] text-white text-xs">Accept</button>{draft.edits[id] && <button onClick={() => setDraft((current) => ({ ...current, edits: Object.fromEntries(Object.entries(current.edits).filter(([key]) => key !== id)) }))} className="px-3 py-1.5 rounded-full border border-[var(--border)] text-xs">Undo</button>}</div>}</div>; })}{draft.selected.length === 0 && <p className="text-sm text-[var(--muted-foreground)] py-8 text-center">Add experience first.</p>}</div>}
                </section>
            </div>
            <div className="xl:sticky xl:top-6"><div className="flex flex-wrap items-center justify-between gap-3 mb-3"><div><h2 className="font-semibold">Tailored resume</h2><p className="text-xs text-[var(--muted-foreground)]">{draft.selected.length} points included</p></div><div className="flex gap-2"><button onClick={onSave} className="px-4 py-2 rounded-full border border-[var(--border)] text-xs">Save</button>{template ? <button onClick={() => downloadResumeWord(template, preview, draft.title)} className="px-4 py-2 rounded-full bg-[var(--primary)] text-white text-xs">Download Word</button> : <button onClick={() => downloadResumePdf(preview, draft.title)} className="px-4 py-2 rounded-full bg-[var(--primary)] text-white text-xs">Download PDF</button>}</div></div><ResumePreview resume={preview} /></div>
        </div>
    );
}

export default function Resume() {
    const { applications } = useApp();
    const stored = useMemo(() => readLocal(STORE_KEY), []);
    const [view, setView] = useState("studio");
    const [master, setMaster] = useState(() => stored?.master || clone(sampleMaster));
    const [versions, setVersions] = useState(() => stored?.versions || []);
    const [template, setTemplate] = useState(() => readLocal(TEMPLATE_KEY));
    const [draft, setDraft] = useState(() => ({ id: uid(), title: "Frontend Developer — Orbit", customTitle: false, applicationId: "", job: { role: "Frontend Developer", company: "Orbit", description: "React, JavaScript, accessible responsive interfaces, REST APIs, and Git collaboration." }, selected: [], edits: {}, updatedAt: new Date().toISOString() }));
    const persist = (nextMaster = master, nextVersions = versions) => localStorage.setItem(STORE_KEY, JSON.stringify({ master: nextMaster, versions: nextVersions }));
    const startTailoring = () => { setDraft({ id: uid(), title: "New tailored resume", customTitle: false, applicationId: "", job: { role: "", company: "", description: "" }, selected: [], edits: {}, updatedAt: new Date().toISOString() }); setView("tailor"); };
    const saveVersion = () => { const saved = { ...clone(draft), updatedAt: new Date().toISOString() }; const next = versions.some((version) => version.id === saved.id) ? versions.map((version) => version.id === saved.id ? saved : version) : [saved, ...versions]; setVersions(next); persist(master, next); setView("studio"); };

    return (
        <div className="h-full overflow-y-auto">
            <header className="px-6 md:px-10 pt-8 pb-5 border-b border-[var(--border)]"><div className="flex items-start justify-between gap-5 flex-wrap"><div><h1 className="font-display text-3xl font-700">Resume</h1><p className="text-sm text-[var(--muted-foreground)] mt-1">Build your master once, then tailor it for every role.</p></div><nav className="flex rounded-full border border-[var(--border)] overflow-hidden" aria-label="Resume workspace">{[["studio", "Resume studio"], ["master", "Edit master"], ["tailor", "Tailor resume"]].map(([id, label]) => <button key={id} onClick={() => setView(id)} className={`px-4 py-2 text-xs transition-colors ${view === id ? "bg-[var(--primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"}`}>{label}</button>)}</nav></div></header>
            <main className="px-6 md:px-10 py-7 max-w-7xl mx-auto">
                {view === "studio" && <div className="max-w-4xl mx-auto"><div className="flex justify-end gap-2 mb-5"><button onClick={() => setView("master")} className="px-4 py-2 rounded-full border border-[var(--border)] text-sm">Edit master</button><button onClick={startTailoring} className="px-4 py-2 rounded-full bg-[var(--primary)] text-white text-sm">+ Clone and tailor</button></div>{versions.length === 0 ? <div className="text-center py-20 bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl"><p className="text-lg font-medium">Your resume variations will appear here.</p><p className="text-sm text-[var(--muted-foreground)] mt-2">Clone your master resume to create one.</p></div> : versions.map((version) => <div key={version.id} className="flex items-center gap-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 mb-3"><span className="w-10 h-10 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] grid place-items-center text-xl">▤</span><div className="min-w-0 flex-1"><h2 className="font-semibold truncate">{version.title}</h2><p className="text-xs text-[var(--muted-foreground)] mt-1">{version.job.role}{version.job.company ? ` · ${version.job.company}` : ""} · Updated {new Date(version.updatedAt).toLocaleDateString()}</p></div><div className="flex gap-2"><button onClick={() => { setDraft(clone(version)); setView("tailor"); }} className="px-3 py-1.5 rounded-full border border-[var(--border)] text-xs">Edit</button><button onClick={() => template ? downloadResumeWord(template, tailoredResume(master, version.selected, version.edits), version.title) : downloadResumePdf(tailoredResume(master, version.selected, version.edits), version.title)} className="w-8 h-8 rounded-full border border-[var(--border)]">↓</button><button onClick={() => { const next = versions.filter((item) => item.id !== version.id); setVersions(next); persist(master, next); }} className="w-8 h-8 rounded-full border border-rose-700/40 text-rose-400">×</button></div></div>)}</div>}
                {view === "master" && <MasterEditor master={master} setMaster={setMaster} template={template} setTemplate={setTemplate} onSave={() => persist(master, versions)} onStartTailoring={() => { persist(master, versions); startTailoring(); }} />}
                {view === "tailor" && <TailorResume master={master} applications={applications || []} draft={draft} setDraft={setDraft} onSave={saveVersion} template={template} />}
            </main>
        </div>
    );
}
