"use client";

import { useSearchParams } from "next/navigation";

export function AuthQueryAlert({
  errors,
  successKey,
  successText,
}: {
  errors: Record<string, string>;
  successKey?: string;
  successText?: string;
}) {
  const params = useSearchParams();
  const error = params.get("error");
  const ok = successKey ? params.get(successKey) : null;

  if (ok && successText) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
        {successText}
      </div>
    );
  }

  if (!error) return null;

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {errors[error] ?? "Une erreur est survenue."}
    </div>
  );
}
