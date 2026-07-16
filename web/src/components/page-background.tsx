export function PageBackground({ children }: { children: React.ReactNode }) {
  return <div className="page-canvas relative min-h-screen">{children}</div>;
}

export const AuthBackground = PageBackground;
