import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { readAuthLinkFromUrl, waitForSupabaseSession } from "@/lib/auth-link";
import { AppNav } from "@/components/AppNav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ApplyPilotLogo } from "@/components/ApplyPilotLogo";

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
          {/*
           * Mobile-only top bar: provides the sidebar trigger on small screens
           * where the sidebar is hidden (rendered as a Sheet/drawer).
           * On desktop (md+) the sidebar is always visible — no top bar needed.
           */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3 md:hidden">
            <SidebarTrigger />
            <ApplyPilotLogo markClassName="h-7 w-7" wordmarkClassName="text-base" />
            <span className="w-8" aria-hidden="true" />
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-5xl px-5 py-7">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  ),
});
