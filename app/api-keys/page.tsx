export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ApiKeysManager } from "@/components/ApiKeysClient";
import { getCurrentUser, getUserApiKeys } from "@/lib/auth";

export default async function ApiKeysPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const apiKeys = getUserApiKeys(user.id);

  return (
    <div className="min-h-screen text-brand-text-primary">
      <Navbar user={user} />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <ApiKeysManager initialKeys={apiKeys} />
      </main>
      <Footer />
    </div>
  );
}
