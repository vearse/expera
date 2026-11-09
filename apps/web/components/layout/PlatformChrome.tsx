import { HubFooter } from "@/components/vanguard/HubFooter";
import { HubHeader } from "@/components/vanguard/HubHeader";

export function PlatformChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HubHeader />
      <div className="flex-1">{children}</div>
      <HubFooter />
    </div>
  );
}
