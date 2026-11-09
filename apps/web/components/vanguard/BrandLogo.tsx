import Image from "next/image";
import Link from "next/link";

export function BrandLogo({
  className = "h-12",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "onDark";
}) {
  if (variant === "onDark") {
    return (
      <Link href="/" className="inline-flex items-center gap-3 text-left">
        <BrandMark className="size-11 shrink-0" />
        <span>
          <span className="block font-display text-xl font-bold leading-tight text-inverse-on-surface">Expera</span>
          <span className="mt-0.5 block text-[11px] font-medium tracking-wide text-inverse-on-surface/65">
            Explore · Experiment · Excel
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Image
      src="/brand/logo.png"
      alt="Expera — Explore, Experiment, Excel"
      width={480}
      height={160}
      priority
      className={`w-auto max-w-none ${className}`}
    />
  );
}

export function BrandMark({ className = "size-9" }: { className?: string }) {
  return <Image src="/brand/icon.png" alt="" width={220} height={233} className={`object-contain ${className}`} />;
}
