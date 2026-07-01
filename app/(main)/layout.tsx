import { SessionProvider } from "@/contexts/SessionContext";
import { MainShell } from "@/components/ui/MainShell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MainShell>{children}</MainShell>
    </SessionProvider>
  );
}
