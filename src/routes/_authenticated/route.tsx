import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { readAuthLinkFromUrl, waitForSupabaseSession } from "@/lib/auth-link";
import { AppNav } from "@/components/AppNav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const { hasTokens, type } = readAuthLinkFromUrl();
      if (hasTokens) {
        await waitForSupabaseSession();
        if (type === "recovery") throw redirect({ to: "/reset-password" });
      }
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 items-center gap-2 border-b border-border px-3">
            <SidebarTrigger />
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-5xl px-4 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  ),
});
