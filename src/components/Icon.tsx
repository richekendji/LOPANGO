type IconName =
  | "grid"
  | "home"
  | "search"
  | "heart"
  | "heartFill"
  | "inbox"
  | "building"
  | "user"
  | "bell"
  | "menu"
  | "more"
  | "close"
  | "chevron"
  | "pin"
  | "publish"
  | "comment"
  | "share"
  | "send"
  | "bookmark"
  | "message"
  | "eye"
  | "eyeOff"
  | "wallet";

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };

  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.8C19 15.6 12 20 12 20Z" />
        </svg>
      );
    case "heartFill":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.8C19 15.6 12 20 12 20Z" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common}>
          <path d="M4 13h4l2 3h4l2-3h4v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" />
          <path d="M4 13 6.5 4h11L20 13" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4 20h16" />
          <path d="M6 20V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" />
          <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <path d="M5 12h14" strokeWidth={2.25} />
        </svg>
      );
    case "comment":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
    case "send":
      return (
        <svg {...common}>
          <path d="m22 2-7 20-4-9-9-4 20-7Z" />
          <path d="M22 2 11 13" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.5L6 20V5a1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m8 10 4 4 4-4" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common} className={`${className} text-[var(--accent)]`}>
          <path
            d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
            fill="currentColor"
            stroke="none"
          />
          <circle cx="12" cy="10" r="2.5" fill="#fff" stroke="none" />
        </svg>
      );
    case "publish":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "eyeOff":
      return (
        <svg {...common}>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a16.7 16.7 0 0 1-3.1 4.1" />
          <path d="M6.1 6.1A16.4 16.4 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.2-.9" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <path d="M20 7H5a2 2 0 0 1 0-4h13v4" />
          <path d="M4 5v13a2 2 0 0 0 2 2h14V7H6" />
          <circle cx="16.5" cy="13.5" r="0.5" />
        </svg>
      );
    default:
      return null;
  }
}
