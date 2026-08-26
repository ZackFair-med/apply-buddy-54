import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getUsageSummary } from "@/lib/usage.functions";
import { toast } from "sonner";
import { ApplyPilotLogo, LogoMark } from "@/components/ApplyPilotLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { FileText, Sparkles, LogOut, User, LayoutDashboard, ListTodo, History } from "lucide-react";

const mainItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/jobs", label: "Tracker", icon: ListTodo, exact: false },
  { to: "/tailor", label: "AI Assistant", icon: Sparkles, exact: false },
  { to: "/cvs", label: "CVs", icon: FileText, exact: false },
] as const;

const footerItems = [{ to: "/profile", label: "Profile", icon: User }] as const;

export function AppNav() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const usageFn = useServerFn(getUsageSummary);
  const { data: usage } = useQuery({
    queryKey: ["usage-summary"],
    queryFn: () => usageFn(),
    staleTime: 60_000,
  });
  const isPaid = usage?.plan === "paid";

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Sign out failed");
      return;
    }
    router.navigate({ to: "/auth" });
  };

  return (
    <Sidebar collapsible="icon">
      {/* Branding + collapse toggle */}
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <Link
            to="/"
            aria-label="ApplyPilot dashboard"
            className="group-data-[collapsible=icon]:hidden"
          >
            <ApplyPilotLogo
              markClassName="h-7 w-7"
              wordmarkClassName="text-base text-sidebar-foreground"
            />
          </Link>
          {/* Icon-only: just the logo mark */}
          <Link
            to="/"
            aria-label="ApplyPilot dashboard"
            className="hidden items-center justify-center group-data-[collapsible=icon]:flex"
          >
            <LogoMark className="h-7 w-7" />
          </Link>
          {/* Desktop collapse trigger — sits in the sidebar header, hidden on mobile */}
          <SidebarTrigger className="hidden text-sidebar-foreground/50 hover:text-sidebar-foreground md:flex" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {/* "Main" group label removed — 4 items need no header */}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(({ to, label, icon: Icon, exact }) => {
                const active = isActive(to, exact);
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                      className={
                        active
                          ? "border-l-2 border-sidebar-primary rounded-l-none pl-[calc(0.5rem-2px)] text-sidebar-foreground font-medium bg-sidebar-accent"
                          : undefined
                      }
                    >
                      <Link to={to}>
                        <Icon className={`h-4 w-4 ${active ? "text-sidebar-primary" : ""}`} />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {isPaid && (
                <SidebarMenuItem>
                  {(() => {
                    const active = isActive("/history", false);
                    return (
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip="History"
                        className={
                          active
                            ? "border-l-2 border-sidebar-primary rounded-l-none pl-[calc(0.5rem-2px)] text-sidebar-foreground font-medium bg-sidebar-accent"
                            : undefined
                        }
                      >
                        <Link to="/history">
                          <History className={`h-4 w-4 ${active ? "text-sidebar-primary" : ""}`} />
                          <span>History</span>
                        </Link>
                      </SidebarMenuButton>
                    );
                  })()}
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footerItems.map(({ to, label, icon: Icon }) => {
            const active = isActive(to, false);
            return (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={label}
                  className={
                    active
                      ? "border-l-2 border-sidebar-primary rounded-l-none pl-[calc(0.5rem-2px)] text-sidebar-foreground font-medium bg-sidebar-accent"
                      : undefined
                  }
                >
                  <Link to={to}>
                    <Icon className={`h-4 w-4 ${active ? "text-sidebar-primary" : ""}`} />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Sign out">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
