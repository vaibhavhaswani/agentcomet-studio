import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, KeyRound, Wrench } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

type NavbarProps = {
  user?: {
    name: string;
    email: string;
  } | null;
};

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
          <Image src="/logo_bg.png" alt="AgentComet" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" priority />
          <span className="pb-1 text-xl font-bold tracking-tight text-brand-text-primary">AgentComet</span>
          <span className="rounded-full border border-brand-accent/20 bg-brand-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
            Local
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-text-primary"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/sdk-setup"
                className="flex items-center space-x-2 text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-text-primary"
              >
                <Wrench className="h-4 w-4" />
                <span>SDK Setup</span>
              </Link>
              <div className="hidden items-center space-x-2 text-xs text-brand-text-secondary md:flex">
                <KeyRound className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-accent/20 transition-all hover:bg-blue-500"
              >
                Create local account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

