import { PlatformChrome } from "@/components/layout/PlatformChrome";

export function SubjectChrome({ children }: { children: React.ReactNode }) {
  return (
    <PlatformChrome>
      <main className="vanguard-container flex-1 pb-8 pt-6">{children}</main>
    </PlatformChrome>
  );
}
