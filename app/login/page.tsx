export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { hasAnyUsers } from "@/lib/db";

export default async function LoginPage() {
  if (!hasAnyUsers()) {
    redirect("/signup");
  }
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 text-brand-text-primary">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/10 blur-[120px]" />
      <AuthForm mode="login" />
    </div>
  );
}

