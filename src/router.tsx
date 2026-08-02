import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { routeTree } from "./routeTree.gen";
import { errorMessage } from "./lib/errors";

export const getRouter = () => {
  const queryClient = new QueryClient({
    // Mutations toast individually; queries had no error path at all, so a failed
    // load rendered as an empty dashboard/list with no indication anything broke.
    queryCache: new QueryCache({
      onError: (error, query) => {
        console.error(`[query] ${String(query.queryKey)} failed:`, error);
        if (typeof window === "undefined") return;
        toast.error(errorMessage(error, "Could not load data"));
      },
    }),
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
