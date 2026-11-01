import { HubHeader } from "@/components/vanguard/HubHeader";
import { HubFooter } from "@/components/vanguard/HubFooter";

export function SubjectChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HubHeader />
      <main className="vanguard-container flex-1 pb-8 pt-6">{children}</main>
      <HubFooter />
    </div>
  );
}
