/** Maison en L — pictogramme LOPANGO. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 80"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M18 38 L50 8 L82 38"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="miter"
      />
      <path
        d="M28 42 V72 H70 V54"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
