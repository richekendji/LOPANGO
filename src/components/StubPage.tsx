export default function StubPage({
  title,
  hint,
}: {
  title: string;
  hint: string;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p>
    </div>
  );
}
