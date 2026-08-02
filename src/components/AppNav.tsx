import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getUsageSummary } from "@/lib/usage.functions";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Briefcase,
  FileText,
  Sparkles,
  LogOut,
  User,
  LayoutDashboard,
  ListTodo,
  History,
} from "lucide-react";

const mainItems = [
  { to: "/", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/jobs", label: "Tracker", icon: ListTodo, exact: false },
  { to: "/tailor", label: "AI Assistant", icon: Sparkles, exact: false },
  { to: "/cvs", label: "CVs", icon: FileText, exact: false },
] as const;

const footerItems = [
  { to: "/profile", label: "Profile", icon: User },
] as const;

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
      <SidebarHeader>
        <Link
          to="/"
          className="flex items-center gap-2 px-2 py-2 font-serif text-base font-semibold tracking-tight"
        >
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Briefcase className="h-4 w-4" />
          </span>
          <span className="truncate group-data-[collapsible=icon]:hidden">
            ApplyPilot
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(({ to, label, icon: Icon, exact }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(to, exact)}
                    tooltip={label}
                  >
                    <Link to={to}>
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isPaid && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/history", false)}
                    tooltip="History"
                  >
                    <Link to="/history">
                      <History className="h-4 w-4" />
                      <span>History</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footerItems.map(({ to, label, icon: Icon }) => (
            <SidebarMenuItem key={to}>
              <SidebarMenuButton
                asChild
                isActive={isActive(to, false)}
                tooltip={label}
              >
                <Link to={to}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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
