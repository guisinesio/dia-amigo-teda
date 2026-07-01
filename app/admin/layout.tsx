import { SessionProvider } from "@/contexts/SessionContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
