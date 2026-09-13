import Image from "next/image";
import Link from "next/link";

export const LOGO_SRC = "/brand/logo.jpg";
export const LOGO_ALT = "LOPANGO";

const SIZES = {
  sm: "h-12 w-12",
  md: "h-[4.5rem] w-[4.5rem]",
  lg: "h-28 w-28",
  hero: "h-36 w-36 sm:h-44 sm:w-44",
} as const;

type BrandLogoProps = {
  href?: string | false;
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  href = "/",
  size = "md",
  className = "",
  priority = false,
}: BrandLogoProps) {
  const img = (
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={1024}
      height={1024}
      priority={priority}
      className={`${SIZES[size]} object-contain`}
    />
  );

  if (href === false) {
    return <span className={`inline-flex ${className}`}>{img}</span>;
  }

  return (
    <Link href={href} className={`inline-flex ${className}`} aria-label={LOGO_ALT}>
      {img}
    </Link>
  );
}
