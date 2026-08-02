import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getProfile, updateProfile, deleteAccount } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile · ApplyPilot" },
      { name: "description", content: "Manage your ApplyPilot account, password, and personal details." },
      { property: "og:title", content: "Profile · ApplyPilot" },
      { property: "og:description", content: "Manage your ApplyPilot account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const router = useRouter();
  const getFn = useServerFn(getProfile);
  const updateFn = useServerFn(updateProfile);
  const deleteFn = useServerFn(deleteAccount);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getFn(),
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
    }
  }, [profile]);

  const saveInfo = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name: [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = useMutation({
    mutationFn: async () => {
      if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");
      if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [confirmText, setConfirmText] = useState("");
  const deleteMut = useMutation({
    mutationFn: () => deleteFn(),
    onSuccess: async () => {
      // The account is already gone; a failed local sign-out must not be hidden,
      // but it also must not keep the user on a dead session.
      const { error } = await supabase.auth.signOut();
      if (error) console.error("[profile.deleteAccount] sign out failed:", error);
      qc.clear();
      toast.success("Account deleted");
      router.navigate({ to: "/auth" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <>
          {/* Section 1: Member information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Member information</CardTitle>
              <CardDescription>Your name and account email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name">First name</Label>
                  <Input
                    id="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input
                    id="last_name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={profile?.email ?? ""} disabled />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveInfo.mutate()} disabled={saveInfo.isPending}>
                  {saveInfo.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Change password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change password</CardTitle>
              <CardDescription>Use at least 8 characters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new_password">New password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm new password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => changePassword.mutate()}
                  disabled={changePassword.isPending || !newPassword || !confirmPassword}
                >
                  {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Delete account */}
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Delete account</CardTitle>
              <CardDescription>
                Permanently delete your account and all your data. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently erase your profile, jobs, CVs, and tailor history.
                      Type <span className="font-semibold">DELETE</span> to confirm.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={confirmText !== "DELETE" || deleteMut.isPending}
                      onClick={(e) => {
                        e.preventDefault();
                        deleteMut.mutate();
                      }}
                    >
                      {deleteMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Permanently delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
