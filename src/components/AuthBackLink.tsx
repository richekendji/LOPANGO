import Link from "next/link";

/** Flèche retour — pages auth (connexion / inscription). */
export function AuthBackLink({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Retour"
      className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ebebeb] bg-white text-zinc-800 shadow-sm transition-transform hover:-translate-y-px hover:bg-zinc-50"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}
