export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-netflix-dark-950 relative overflow-hidden">
      {/* Netflix-style background pattern */}
      <div className="absolute inset-0 bg-netflix-dark-950">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(229, 9, 20, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(229, 9, 20, 0.1) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-netflix-dark-950 via-netflix-dark-900 to-netflix-dark-950" />
        <div className="absolute inset-0 bg-gradient-to-tl from-netflix-600/5 via-transparent to-netflix-600/5" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
