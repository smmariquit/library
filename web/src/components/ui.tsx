import { CircleAlert, CircleCheck, Clock3, Info, LoaderCircle } from "lucide-react";
import type { Book } from "@/lib/api";

const statusStyles: Record<Book["reading_status"], string> = {
  unread: "status-unread border",
  reading: "status-reading border",
  finished: "status-finished border",
};

const statusLabels: Record<Book["reading_status"], string> = {
  unread: "Unread",
  reading: "Reading",
  finished: "Finished",
};

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function StatusBadge({ status }: { status: Book["reading_status"] }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export function Button({
  children,
  className = "",
  loading = false,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    ghost: "btn-ghost",
  };
  return (
    <button
      type="button"
      className={`${variants[variant]} ${className}`}
      aria-busy={loading || undefined}
      {...props}
      disabled={loading || props.disabled}
    >
      {loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-muted">
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="field-input" {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="field-input" {...props} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="field-input" {...props} />;
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

export function Alert({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "error" | "success" | "waiting" | "ready" }) {
  const tones = {
    neutral: "alert-neutral",
    error: "alert-error",
    success: "alert-success",
    waiting: "alert-waiting",
    ready: "alert-ready",
  };
  const icons = {
    neutral: Info,
    error: CircleAlert,
    success: CircleCheck,
    waiting: Clock3,
    ready: CircleCheck,
  };
  const Icon = icons[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}
    >
      <Icon aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${tone === "waiting" ? "animate-pulse" : ""}`} />
      <span>{children}</span>
    </div>
  );
}

export function LoadingShelf() {
  return (
    <div className="page-canvas min-h-screen" role="status" aria-label="Loading your library">
      <span className="sr-only">Loading your library…</span>
      <div className="mx-auto max-w-5xl px-6 py-10 page-enter">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton mt-4 h-10 w-56" />
        <div className="skeleton mt-3 h-4 w-40" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="panel p-5">
              <div className="skeleton h-5 w-20" />
              <div className="skeleton mt-4 h-7 w-3/4" />
              <div className="skeleton mt-3 h-4 w-1/2" />
              <div className="skeleton mt-5 h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoadingBook() {
  return (
    <div className="page-canvas min-h-screen" role="status" aria-label="Loading book details">
      <span className="sr-only">Loading book details…</span>
      <div className="mx-auto max-w-5xl px-6 py-10 page-enter">
        <div className="skeleton h-4 w-32" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="panel p-6">
            <div className="skeleton h-5 w-24" />
            <div className="skeleton mt-4 h-10 w-2/3" />
            <div className="skeleton mt-3 h-5 w-1/3" />
            <div className="skeleton mt-6 h-11 w-32" />
          </div>
          <div className="panel p-5">
            <div className="skeleton h-6 w-28" />
            <div className="skeleton mt-5 h-10 w-full" />
            <div className="skeleton mt-4 h-10 w-full" />
            <div className="skeleton mt-4 h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
