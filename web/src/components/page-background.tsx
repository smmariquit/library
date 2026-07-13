export function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-canvas relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="page-glow page-glow-top" />
        <div className="page-glow page-glow-bottom" />
        <div className="page-grid" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-canvas relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="page-glow page-glow-top" />
        <div className="auth-shelf" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
