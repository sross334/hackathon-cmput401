import { useMemo } from "react";
import { useApp } from "../AppContext";

const STATUS_META = {
  wishlist: {
    label: "Wishlist",
    color: "text-slate-400",
    bg: "bg-slate-900/40",
    border: "border-slate-700/40",
  },
  applied: {
    label: "Applied",
    color: "text-blue-300",
    bg: "bg-blue-900/40",
    border: "border-blue-700/40",
  },
  phone_screen: {
    label: "Phone Screen",
    color: "text-cyan-300",
    bg: "bg-cyan-900/40",
    border: "border-cyan-700/40",
  },
  interview: {
    label: "Interview",
    color: "text-amber-300",
    bg: "bg-amber-900/40",
    border: "border-amber-700/40",
  },
  offer: {
    label: "Offer",
    color: "text-emerald-300",
    bg: "bg-emerald-900/40",
    border: "border-emerald-700/40",
  },
  rejected: {
    label: "Rejected",
    color: "text-rose-300",
    bg: "bg-rose-900/40",
    border: "border-rose-700/40",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "text-zinc-400",
    bg: "bg-zinc-900/40",
    border: "border-zinc-700/40",
  },
};

const COMM_TYPE_META = {
  email: { label: "Email", icon: "✉" },
  call: { label: "Call", icon: "📞" },
  interview: { label: "Interview", icon: "🎙" },
  offer_received: { label: "Offer received", icon: "+" },
  rejection: { label: "Rejected", icon: "✕" },
  follow_up: { label: "Follow-up", icon: "↩" },
  note: { label: "Note", icon: "✏" },
};

function formatDate(date) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function daysFromNow(date) {
  if (!date) return null;

  const difference =
    new Date(`${date}T00:00:00`).getTime() - Date.now();

  return Math.ceil(difference / 86400000);
}

export default function Dashboard({ onNavigate }) {
  const { applications } = useApp();

  const stats = useMemo(() => {
    const active = applications.filter(
      (application) =>
        !["rejected", "withdrawn"].includes(application.status)
    );

    const offers = applications.filter(
      (application) => application.status === "offer"
    );

    const interviews = applications.filter(
      (application) => application.status === "interview"
    );

    const responseRate = applications.length
      ? Math.round(
          (applications.filter(
            (application) => application.communications.length > 0
          ).length /
            applications.length) *
            100
        )
      : 0;

    return {
      total: applications.length,
      active: active.length,
      offers: offers.length,
      interviews: interviews.length,
      responseRate,
    };
  }, [applications]);

  const reminders = useMemo(
    () =>
      applications
        .filter((application) => {
          const days = daysFromNow(application.reminderDate);

          return (
            application.reminderDate &&
            days !== null &&
            days <= 7
          );
        })
        .sort((a, b) =>
          a.reminderDate.localeCompare(b.reminderDate)
        ),
    [applications]
  );

  const recentComms = useMemo(() => {
    const allCommunications = applications.flatMap((application) =>
      application.communications.map((communication) => ({
        ...communication,
        appName: application.company,
        position: application.position,
        appId: application.id,
      }))
    );

    return allCommunications
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [applications]);

  const statusCounts = useMemo(() => {
    const counts = {};

    for (const application of applications) {
      counts[application.status] =
        (counts[application.status] || 0) + 1;
    }

    return counts;
  }, [applications]);

  const activePipeline = useMemo(
    () =>
      applications
        .filter((application) =>
          ["applied", "phone_screen", "interview", "offer"].includes(
            application.status
          )
        )
        .sort((a, b) =>
          b.dateApplied.localeCompare(a.dateApplied)
        )
        .slice(0, 5),
    [applications]
  );

  const funnelStatuses = [
    "wishlist",
    "applied",
    "phone_screen",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[var(--muted-foreground)] text-sm uppercase tracking-widest font-medium mb-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>

        <h1 className="font-display text-4xl md:text-5xl font-700">
          Good morning,
          <br />
          <span className="text-[var(--primary)]">Abel Tesfaye.</span>
        </h1>

        {stats.offers > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 text-sm font-medium">
            You have {stats.offers} active offer
            {stats.offers > 1 ? "s" : ""}! Don't forget to respond.
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Applications",
            value: stats.total,
            sub: "all time",
            color: "text-[var(--primary)]",
          },
          {
            label: "Active Pipeline",
            value: stats.active,
            sub: "in progress",
            color: "text-cyan-400",
          },
          {
            label: "Interviews",
            value: stats.interviews,
            sub: "scheduled / in progress",
            color: "text-amber-400",
          },
          {
            label: "Response Rate",
            value: `${stats.responseRate}%`,
            sub: "companies responded",
            color: "text-emerald-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6"
          >
            <p
              className={`font-display text-4xl font-700 ${stat.color}`}
            >
              {stat.value}
            </p>
            <p className="text-[var(--foreground)] font-medium text-sm mt-1">
              {stat.label}
            </p>
            <p className="text-[var(--muted-foreground)] text-xs mt-0.5">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Funnel and reminders */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Funnel */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="font-semibold">Application Funnel</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {applications.length} total application{applications.length === 1 ? "" : "s"}
              </p>
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">by stage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {funnelStatuses.map((status) => {
              const count = statusCounts[status] || 0;
              const percentage = applications.length
                ? (count / applications.length) * 100
                : 0;

              const meta = STATUS_META[status];

              return (
                <div
                  key={status}
                  className="min-h-36 min-w-0 flex flex-col justify-between gap-6 p-5 rounded-2xl bg-[var(--secondary)]/45 border border-[var(--border)] last:lg:col-span-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-base font-semibold truncate ${meta.color}`}>
                      {meta.label}
                    </p>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.dot }}
                    />
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      {Math.round(percentage)}% of total
                    </p>
                    <span className="text-4xl leading-none font-bold text-[var(--foreground)]">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reminders */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Reminders</h2>

            {reminders.length > 0 && (
              <span className="chip text-[11px] bg-rose-900/40 text-rose-300 border border-rose-700/40">
                {reminders.length} due soon
              </span>
            )}
          </div>

          {reminders.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
              <p className="text-2xl mb-2">🎯</p>
              No reminders in the next 7 days.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reminders.map((application) => {
                const days = daysFromNow(application.reminderDate);

                const urgency =
                  days <= 1
                    ? "text-rose-300"
                    : days <= 3
                    ? "text-amber-300"
                    : "text-[var(--muted-foreground)]";

                return (
                  <div
                    key={application.id}
                    className="p-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {application.company}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                          {application.reminderNote}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-semibold shrink-0 ${urgency}`}
                      >
                        {days === 0
                          ? "Today"
                          : days === 1
                          ? "Tomorrow"
                          : `${days}d`}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {formatDate(application.reminderDate)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active pipeline and recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active pipeline */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Active Pipeline</h2>

            <button
              onClick={() => onNavigate("applications")}
              className="text-xs text-[var(--primary)] hover:underline"
            >
              View all →
            </button>
          </div>

          {activePipeline.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
              No active applications yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {activePipeline.map((application) => {
                const meta = STATUS_META[application.status];

                return (
                  <div
                    key={application.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--secondary)] transition-colors group"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 text-white"
                      style={{
                        backgroundColor: `${application.logoColor}33`,
                        border: `1px solid ${application.logoColor}55`,
                        color: application.logoColor,
                      }}
                    >
                      {application.company[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {application.company}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {application.position}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`chip text-[11px] ${meta.bg} ${meta.color} ${meta.border}`}
                      >
                        {meta.label}
                      </span>

                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        {formatDate(application.dateApplied)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Recent Activity</h2>

            <button
              onClick={() => onNavigate("communications")}
              className="text-xs text-[var(--primary)] hover:underline"
            >
              View all →
            </button>
          </div>

          {recentComms.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
              No communications logged yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentComms.map((communication) => {
                const meta =
                  COMM_TYPE_META[communication.type] ||
                  COMM_TYPE_META.note;

                return (
                  <div
                    key={communication.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--secondary)] transition-colors"
                  >
                    <span className="w-7 h-7 rounded-lg bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-sm shrink-0">
                      {meta.icon}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium truncate">
                          {communication.appName}
                        </p>

                        <span className="text-[11px] text-[var(--muted-foreground)] shrink-0">
                          {formatDate(communication.date)}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                        {communication.subject}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
