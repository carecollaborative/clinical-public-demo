"use client";

export default function GradingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100">
      {children}
    </div>
  );
}
