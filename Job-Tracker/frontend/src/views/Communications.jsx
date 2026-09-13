import { useState, useMemo } from "react";
import { useApp } from "../AppContext";

const STATUS_META = {
  wishlist: { label: "Wishlist", color: "text-slate-400" },
  applied: { label: "Applied", color: "text-blue-300" },
  phone_screen: { label: "Phone Screen", color: "text-cyan-300" },
  interview: { label: "Interview", color: "text-amber-300" },
  offer: { label: "Offer", color: "text-emerald-300" },
  rejected: { label: "Rejected", color: "text-rose-300" },
  withdrawn: { label: "Withdrawn", color: "text-zinc-400" },
};

const COMM_META = {
  email: {
    label: "Email",
    icon: "✉",
    color: "text-blue-300",
    bg: "bg-blue-900/30",
    border: "border-blue-700/40",
  },
  call: {
    label: "Call",
    icon: "📞",
    color: "text-cyan-300",
    bg: "bg-cyan-900/30",
    border: "border-cyan-700/40",
  },
  interview: {
    label: "Interview",
    icon: "🎙",
    color: "text-amber-300",
    bg: "bg-amber-900/30",
    border: "border-amber-700/40",
  },
  offer_received: {
    label: "Offer received",
    icon: "🎉",
    color: "text-emerald-300",
    bg: "bg-emerald-900/30",
    border: "border-emerald-700/40",
  },
  rejection: {
    label: "Rejection",
    icon: "✕",
    color: "text-rose-300",
    bg: "bg-rose-900/30",
    border: "border-rose-700/40",
  },
  follow_up: {
    label: "Follow-up sent",
    icon: "↩",
    color: "text-violet-300",
    bg: "bg-violet-900/30",
    border: "border-violet-700/40",
  },
  note: {
    label: "Note",
    icon: "✏",
    color: "text-zinc-300",
    bg: "bg-zinc-900/30",
    border: "border-zinc-700/40",
  },
};

function formatDate(date) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByMonth(items) {
  const groups = {};

  for (const item of items) {
    const key = item.date.slice(0, 7);

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);
  }

  return groups;
}

function monthLabel(key) {
  const [year, month] = key.split("-");

  return new Date(
    Number(year),
    Number(month) - 1
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function Communications() {
  const { applications, deleteCommunication } = useApp();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const allComms = useMemo(() => {
    return applications
      .flatMap((app) =>
        app.communications.map((communication) => ({
          ...communication,
          appId: app.id,
          company: app.company,
          position: app.position,
          logoColor: app.logoColor,
          appStatus: app.status,
        }))
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [applications]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();

    return allComms.filter(
      (communication) =>
        (typeFilter === "all" || communication.type === typeFilter) &&
        (!query ||
          communication.company.toLowerCase().includes(query) ||
          communication.subject.toLowerCase().includes(query) ||
          communication.body.toLowerCase().includes(query))
    );
  }, [allComms, search, typeFilter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const sortedMonths = Object.keys(grouped).sort((a, b) =>
    b.localeCompare(a)
  );

  const typeCounts = useMemo(() => {
    const counts = {};

    for (const communication of allComms) {
      counts[communication.type] =
        (counts[communication.type] || 0) + 1;
    }

    return counts;
  }, [allComms]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 md:px-10 pt-8 pb-4 border-b border-[var(--border)] shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="font-display text-3xl font-700">
              Communications
            </h1>

            <p className="text-[var(--muted-foreground)] text-sm mt-0.5">
              {allComms.length} entries across{" "}
              {
                applications.filter(
                  (application) => application.communications.length > 0
                ).length
              }{" "}
              companies
            </p>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search communications..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-full text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors w-56"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter("all")}
            className={`chip transition-all text-[11px] ${
              typeFilter === "all"
                ? "bg-[var(--primary)] text-white border border-[var(--primary)]"
                : "bg-[var(--secondary)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-purple-500/50"
            }`}
          >
            All ({allComms.length})
          </button>

          {Object.entries(COMM_META).map(([type, meta]) => {
            const count = typeCounts[type] || 0;

            if (!count) return null;

            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`chip transition-all text-[11px] gap-1.5 ${
                  typeFilter === type
                    ? `${meta.bg} ${meta.color} ${meta.border}`
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-purple-500/50"
                }`}
              >
                <span>{meta.icon}</span>
                {meta.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-[var(--muted-foreground)]">
            <p className="text-4xl mb-4">📭</p>

            <p className="text-lg font-medium text-[var(--foreground)] mb-2">
              No communications found
            </p>

            <p className="text-sm">
              Log communications from the Applications view by opening a role
              and clicking &quot;Log entry&quot;.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            {sortedMonths.map((month) => (
              <div key={month}>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest shrink-0">
                    {monthLabel(month)}
                  </p>

                  <div className="flex-1 h-px bg-[var(--border)]" />

                  <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                    {grouped[month].length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 relative">
                  <div className="absolute left-5 top-4 bottom-4 w-px bg-[var(--border)]" />

                  {grouped[month].map((communication) => {
                    const meta = COMM_META[communication.type];
                    const statusMeta =
                      STATUS_META[communication.appStatus];

                    return (
                      <div
                        key={communication.id}
                        className="flex items-start gap-4 pl-12 relative group"
                      >
                        <div
                          className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center text-sm border ${meta.bg} ${meta.border} shrink-0`}
                        >
                          {meta.icon}
                        </div>

                        <div className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)]/30 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                style={{
                                  backgroundColor: `${communication.logoColor}22`,
                                  border: `1px solid ${communication.logoColor}44`,
                                  color: communication.logoColor,
                                }}
                              >
                                {communication.company[0]}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-semibold text-sm">
                                    {communication.company}
                                  </span>

                                  <span
                                    className={`text-[11px] ${statusMeta?.color || ""}`}
                                  >
                                    {statusMeta?.label || communication.appStatus}
                                  </span>
                                </div>

                                <p className="text-xs text-[var(--muted-foreground)] truncate">
                                  {communication.position}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`chip text-[11px] ${meta.bg} ${meta.color} ${meta.border}`}
                              >
                                {meta.label}
                              </span>

                              <button
                                onClick={() =>
                                  deleteCommunication(
                                    communication.appId,
                                    communication.id
                                  )
                                }
                                className="text-[var(--muted-foreground)] hover:text-rose-400 transition-colors text-lg leading-none opacity-0 group-hover:opacity-100"
                                aria-label="Delete communication"
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium">
                              {communication.subject}
                            </p>

                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                              {formatDate(communication.date)}
                            </p>

                            {communication.body && (
                              <p className="text-xs text-[var(--foreground)]/70 mt-2 leading-relaxed border-t border-[var(--border)] pt-2">
                                {communication.body}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
