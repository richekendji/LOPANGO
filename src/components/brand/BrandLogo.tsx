import Link from "next/link";
import { LogoMark } from "./LogoMark";

export const BRAND_TAGLINE = "Louer est facile";

const SIZES = {
  sm: { mark: "h-[22px] w-[22px]", word: "text-[15px]" },
  md: { mark: "h-7 w-7", word: "text-lg" },
  lg: { mark: "h-11 w-11", word: "text-2xl" },
} as const;

type BrandLogoProps = {
  href?: string | false;
  size?: keyof typeof SIZES;
  stacked?: boolean;
  withTagline?: boolean;
  className?: string;
};

export function BrandLogo({
  href = "/",
  size = "md",
  stacked = false,
  withTagline = false,
  className = "",
}: BrandLogoProps) {
  const s = SIZES[size];
  const inner = stacked ? (
    <span className="inline-flex flex-col items-center">
      <LogoMark className={s.mark} />
      <span className={`mt-1.5 font-black tracking-tight ${s.word}`}>
        LOPANGO
      </span>
      {withTagline ? (
        <span className="mt-0.5 text-[11px] font-medium tracking-wide text-current/50">
          {BRAND_TAGLINE}
        </span>
      ) : null}
    </span>
  ) : (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={s.mark} />
      <span className="flex flex-col leading-none">
        <span className={`font-black tracking-tight ${s.word}`}>LOPANGO</span>
        {withTagline ? (
          <span className="mt-1 text-[10px] font-medium tracking-wide text-current/50">
            {BRAND_TAGLINE}
          </span>
        ) : null}
      </span>
    </span>
  );

  if (href === false) {
    return <span className={className}>{inner}</span>;
  }

  return (
    <Link href={href} className={className} aria-label="LOPANGO, louer est facile">
      {inner}
    </Link>
  );
}
