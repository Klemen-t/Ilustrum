import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userData = {
    id: user.id,
    name: user.displayName || user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role.name,
    level: user.level,
    xp: user.xp,
    xpToNextLevel: user.xpToNextLevel,
    points: user.points,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={userData} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {children}
      </main>
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>ILUSTRUM · Plataforma educativa de col·leccionisme de cromos · Institut Lacetània (Manresa)</p>
      </footer>
    </div>
  );
}
