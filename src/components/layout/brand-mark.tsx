import { SiteImage } from "@/components/ui/site-image";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  siteLogo?: string | null;
  siteName: string;
  tagline?: string | null;
  className?: string;
  logoClassName?: string;
  showText?: boolean;
  compact?: boolean;
  priority?: boolean;
};

export function BrandMark({
  siteLogo,
  siteName,
  tagline,
  className,
  logoClassName,
  showText = true,
  compact = false,
  priority = false,
}: BrandMarkProps) {
  const logoSize = compact ? "h-9 w-11" : "h-10 w-14";

  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <span className={cn("relative block shrink-0 overflow-hidden", logoSize, logoClassName)}>
        <SiteImage
          src={siteLogo || "/brand/madina-logo.png"}
          alt={siteName}
          fill
          priority={priority}
          sizes={compact ? "44px" : "56px"}
          className="object-contain"
        />
      </span>
      {showText && (
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-extrabold tracking-tight text-dark-900 dark:text-white">{siteName}</span>
          {tagline && <span className="mt-0.5 block truncate text-[11px] font-medium text-dark-400 dark:text-slate-500">{tagline}</span>}
        </span>
      )}
    </span>
  );
}
