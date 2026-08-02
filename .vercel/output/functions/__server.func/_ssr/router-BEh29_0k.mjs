import { o as __toESM } from "../_runtime.mjs";
import { A as redirect, _ as useRouter, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as QueryCache, t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-C6ZaJElq.mjs";
import { i as waitForSupabaseSession, n as processAuthLinkFromUrl, r as readAuthLinkFromUrl } from "./auth-link-FLqotxOI.mjs";
import { t as errorMessage } from "./errors-CRpvjv8q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BEh29_0k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-dk_ZAFEK.css";
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
/**
* Fallback for Supabase auth links whose tokens land on an unexpected route
* (usually `/` when the redirect URL isn't allow-listed). Root `beforeLoad`
* handles this first; this hook covers client-only edge cases.
*/
function useAuthHashRedirect() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		processAuthLinkFromUrl().then((target) => {
			if (target) router.navigate({ to: target });
		}).catch((e) => console.error("[auth-hash-redirect] failed:", e));
	}, [router]);
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$12 = createRootRouteWithContext()({
	beforeLoad: async () => {
		if (typeof window === "undefined") return;
		const target = await processAuthLinkFromUrl();
		if (target) throw redirect({ to: target });
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Lovable App" },
			{
				name: "description",
				content: "Job Pilot is a web app for managing job applications, tailoring CVs, and generating cover letters."
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "Lovable App"
			},
			{
				property: "og:description",
				content: "Job Pilot is a web app for managing job applications, tailoring CVs, and generating cover letters."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			},
			{
				name: "twitter:title",
				content: "Lovable App"
			},
			{
				name: "twitter:description",
				content: "Job Pilot is a web app for managing job applications, tailoring CVs, and generating cover letters."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9f0ccb83-80fb-4252-b0ba-3bf587bbf62c/id-preview-db76add3--feb9d92f-1372-4633-b300-d4d182863ae7.lovable.app-1784915410535.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9f0ccb83-80fb-4252-b0ba-3bf587bbf62c/id-preview-db76add3--feb9d92f-1372-4633-b300-d4d182863ae7.lovable.app-1784915410535.png"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$12.useRouteContext();
	useAuthHashRedirect();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})]
	});
}
var $$splitComponentImporter$10 = () => import("./route-v2d8Esil.mjs");
var Route$11 = createFileRoute("/_authenticated")({
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
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./auth-U5iXXTDm.mjs");
var Route$10 = createFileRoute("/auth")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Sign in · ApplyPilot" },
		{
			name: "description",
			content: "Sign in to ApplyPilot to track your job applications, CVs, and AI-tailored cover letters."
		},
		{
			property: "og:title",
			content: "Sign in · ApplyPilot"
		},
		{
			property: "og:description",
			content: "Sign in to ApplyPilot."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./forgot-password-BP6TlExE.mjs");
var Route$9 = createFileRoute("/forgot-password")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Forgot password · ApplyPilot" },
		{
			name: "description",
			content: "Request a password reset link for your ApplyPilot account."
		},
		{
			property: "og:title",
			content: "Forgot password · ApplyPilot"
		},
		{
			property: "og:description",
			content: "Request a password reset link for your ApplyPilot account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./reset-password-uIlgyQqh.mjs");
var Route$8 = createFileRoute("/reset-password")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Reset password · ApplyPilot" },
		{
			name: "description",
			content: "Choose a new password for your ApplyPilot account."
		},
		{
			property: "og:title",
			content: "Reset password · ApplyPilot"
		},
		{
			property: "og:description",
			content: "Choose a new password for your ApplyPilot account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("../_authenticated-0Q4kFkR_.mjs");
var Route$7 = createFileRoute("/_authenticated/")({
	head: () => ({ meta: [
		{ title: "Dashboard · ApplyPilot" },
		{
			name: "description",
			content: "Your career goal, weekly applications progress, and pipeline breakdown."
		},
		{
			property: "og:title",
			content: "Dashboard · ApplyPilot"
		},
		{
			property: "og:description",
			content: "Track your career goal and application pipeline."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./cvs-BvC2gNyW.mjs");
var Route$6 = createFileRoute("/_authenticated/cvs")({
	head: () => ({ meta: [
		{ title: "CVs · ApplyPilot" },
		{
			name: "description",
			content: "Upload and tag multiple CV versions. Text is extracted once and reused across AI tailoring."
		},
		{
			property: "og:title",
			content: "CVs · ApplyPilot"
		},
		{
			property: "og:description",
			content: "Manage your CV versions."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./history-bSfR_dzG.mjs");
var Route$5 = createFileRoute("/_authenticated/history")({
	head: () => ({ meta: [
		{ title: "Match History · ApplyPilot" },
		{
			name: "description",
			content: "Compare past AI match scores across jobs and CVs."
		},
		{
			property: "og:title",
			content: "Match History · ApplyPilot"
		},
		{
			property: "og:description",
			content: "Compare past AI match scores across jobs and CVs."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./jobs-DAwEnyDa.mjs");
var Route$4 = createFileRoute("/_authenticated/jobs")({
	head: () => ({ meta: [
		{ title: "Tracker · ApplyPilot" },
		{
			name: "description",
			content: "Your saved, applied, and interview-stage job applications in one place."
		},
		{
			property: "og:title",
			content: "Tracker · ApplyPilot"
		},
		{
			property: "og:description",
			content: "Track your job applications."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./profile-Bf0vk3qU.mjs");
var Route$3 = createFileRoute("/_authenticated/profile")({
	head: () => ({ meta: [
		{ title: "Profile · ApplyPilot" },
		{
			name: "description",
			content: "Manage your ApplyPilot account, password, and personal details."
		},
		{
			property: "og:title",
			content: "Profile · ApplyPilot"
		},
		{
			property: "og:description",
			content: "Manage your ApplyPilot account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./tailor-Bm8v8PNJ.mjs");
var Route$2 = createFileRoute("/_authenticated/tailor")({
	head: () => ({ meta: [
		{ title: "AI Assistant · ApplyPilot" },
		{
			name: "description",
			content: "Paste a job description and get an AI match score, keyword analysis, and a tailored cover letter — each on demand."
		},
		{
			property: "og:title",
			content: "AI Assistant · ApplyPilot"
		},
		{
			property: "og:description",
			content: "AI-tailored cover letters and match analysis."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./auth.callback-dAuRFX4d.mjs");
var Route$1 = createFileRoute("/auth/callback")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Signing you in · ApplyPilot" },
		{
			name: "description",
			content: "Finalizing your ApplyPilot sign-in."
		},
		{
			property: "og:title",
			content: "Signing you in · ApplyPilot"
		},
		{
			property: "og:description",
			content: "Finalizing your ApplyPilot sign-in."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
/** Auth errors arrive either in the query string or in the URL hash. */
/**
* Read-only deployment diagnostics. Reports ONLY whether server env vars are
* present — never their values — and only to a caller that knows
* `HEALTH_DIAGNOSTICS_TOKEN` (sent as `x-health-token` or `?token=`). Without a
* configured or matching token the endpoint is a bare liveness check, so the
* server's configuration surface isn't public.
*/
var Route = createFileRoute("/api/public/health/config")({ server: { handlers: { GET: async ({ request }) => {
	const headers = { "cache-control": "no-store" };
	const expected = process.env.HEALTH_DIAGNOSTICS_TOKEN?.trim();
	const provided = request.headers.get("x-health-token")?.trim() ?? new URL(request.url).searchParams.get("token")?.trim();
	if (!expected || provided !== expected) return Response.json({ ok: true }, { headers });
	const present = (name) => Boolean(process.env[name]?.trim());
	return Response.json({
		ok: true,
		env: {
			SUPABASE_URL: present("SUPABASE_URL"),
			SUPABASE_PUBLISHABLE_KEY: present("SUPABASE_PUBLISHABLE_KEY"),
			SUPABASE_SERVICE_ROLE_KEY: present("SUPABASE_SERVICE_ROLE_KEY"),
			ADZUNA_APP_ID: present("ADZUNA_APP_ID"),
			ADZUNA_APP_KEY: present("ADZUNA_APP_KEY"),
			JOBS_PROVIDER: process.env.JOBS_PROVIDER ?? "adzuna (default)",
			AI_API_KEY: present("AI_API_KEY"),
			AI_MODEL: process.env.AI_MODEL ?? "(default)",
			LOVABLE_API_KEY: present("LOVABLE_API_KEY")
		}
	}, { headers });
} } } });
var AuthenticatedRouteRoute = Route$11.update({
	id: "/_authenticated",
	getParentRoute: () => Route$12
});
var AuthRoute = Route$10.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$12
});
var ForgotPasswordRoute = Route$9.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$12
});
var ResetPasswordRoute = Route$8.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$12
});
var AuthenticatedIndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedCvsRoute = Route$6.update({
	id: "/cvs",
	path: "/cvs",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedHistoryRoute = Route$5.update({
	id: "/history",
	path: "/history",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedJobsRoute = Route$4.update({
	id: "/jobs",
	path: "/jobs",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProfileRoute = Route$3.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTailorRoute = Route$2.update({
	id: "/tailor",
	path: "/tailor",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthCallbackRoute = Route$1.update({
	id: "/callback",
	path: "/callback",
	getParentRoute: () => AuthRoute
});
var ApiPublicHealthConfigRoute = Route.update({
	id: "/api/public/health/config",
	path: "/api/public/health/config",
	getParentRoute: () => Route$12
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedCvsRoute,
	AuthenticatedHistoryRoute,
	AuthenticatedJobsRoute,
	AuthenticatedProfileRoute,
	AuthenticatedTailorRoute,
	AuthenticatedIndexRoute
};
var AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
var AuthRouteChildren = { AuthCallbackRoute };
var rootRouteChildren = {
	AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
	AuthRoute: AuthRoute._addFileChildren(AuthRouteChildren),
	ForgotPasswordRoute,
	ResetPasswordRoute,
	ApiPublicHealthConfigRoute
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient({ queryCache: new QueryCache({ onError: (error, query) => {
			console.error(`[query] ${String(query.queryKey)} failed:`, error);
			if (typeof window === "undefined") return;
			toast.error(errorMessage(error, "Could not load data"));
		} }) }) },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
