import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { UserProvider } from "@/components/layout/UserContext";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userName = session.user.name ?? session.user.email ?? "Usuario";

  return (
    <UserProvider user={{ id: session.user.id, name: userName, role: session.user.role }}>
      <AppShell userName={userName} userRole={session.user.role}>
        {children}
      </AppShell>
    </UserProvider>
  );
}
