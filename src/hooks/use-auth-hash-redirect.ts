import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { processAuthLinkFromUrl } from "@/lib/auth-link";

/**
 * Fallback for Supabase auth links whose tokens land on an unexpected route
 * (usually `/` when the redirect URL isn't allow-listed). Root `beforeLoad`
 * handles this first; this hook covers client-only edge cases.
 */
export function useAuthHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    processAuthLinkFromUrl()
      .then((target) => {
        if (target) router.navigate({ to: target });
      })
      .catch((e) => console.error("[auth-hash-redirect] failed:", e));
  }, [router]);
}
