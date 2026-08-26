import { o as __toESM } from "../_runtime.mjs";
import { A as redirect, _ as useRouter, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as QueryCache, t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-C1nPdEEu.mjs";
import { i as waitForSupabaseSession, n as processAuthLinkFromUrl, r as readAuthLinkFromUrl } from "./auth-link-DBxvJQmx.mjs";
import { t as ApplyPilotLogo } from "./ApplyPilotLogo-BD61uhC_.mjs";
import { t as errorMessage } from "./errors-CRpvjv8q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-__KML2Vz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DoMJKpHN.css";
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyPilotLogo, {
					className: "mb-8 justify-center",
					markClassName: "h-10 w-10"
				}),
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyPilotLogo, {
					className: "mb-8 justify-center",
					markClassName: "h-10 w-10"
				}),
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
var Route$11 = createRootRouteWithContext()({
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
			{ title: "ApplyPilot" },
			{
				name: "description",
				content: "Compare your CV with a job description, understand real strengths and gaps, improve supported experience, and create a tailored cover letter."
			},
			{
				name: "author",
				content: "ApplyPilot"
			},
			{
				property: "og:title",
				content: "ApplyPilot"
			},
			{
				property: "og:description",
				content: "Evidence-grounded CV matching, factual rewrites, tailored cover letters, and application tracking."
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
				name: "twitter:title",
				content: "ApplyPilot"
			},
			{
				name: "twitter:description",
				content: "Evidence-grounded CV matching, factual rewrites, tailored cover letters, and application tracking."
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/applypilot-mark.svg",
				type: "image/svg+xml"
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
	const { queryClient } = Route$11.useRouteContext();
	useAuthHashRedirect();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})]
	});
}
var $$splitComponentImporter$10 = () => import("./reset-password-BLPCHU8t.mjs");
var Route$10 = createFileRoute("/reset-password")({
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
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./forgot-password-BX8EYa7u.mjs");
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
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./auth-B5bGlngS.mjs");
var Route$8 = createFileRoute("/auth")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "ApplyPilot · Know if you’re a real fit before you apply" },
		{
			name: "description",
			content: "Analyze your CV against actual job requirements, improve your application without inventing experience, and create a tailored cover letter."
		},
		{
			property: "og:title",
			content: "Know if you’re a real fit before you apply · ApplyPilot"
		},
		{
			property: "og:description",
			content: "Evidence-grounded CV analysis, improvements, cover letters, and application tracking."
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
var $$splitComponentImporter$7 = () => import("./route-DlCHxn-1.mjs");
var Route$7 = createFileRoute("/_authenticated")({
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
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("../_authenticated-Cwx606Mg.mjs");
var Route$6 = createFileRoute("/_authenticated/")({
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
var $$splitComponentImporter$5 = () => import("./auth.callback-wQo_jXa8.mjs");
var Route$5 = createFileRoute("/auth/callback")({
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
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
/** Auth errors arrive either in the query string or in the URL hash. */
var $$splitComponentImporter$4 = () => import("./tailor-Br7bRleX.mjs");
var Route$4 = createFileRoute("/_authenticated/tailor")({
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
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./profile-DraNVzS9.mjs");
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
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./jobs-Ci5ZI7w2.mjs");
var Route$2 = createFileRoute("/_authenticated/jobs")({
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
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./history-LkNcapz4.mjs");
var Route$1 = createFileRoute("/_authenticated/history")({
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
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./cvs-Dqjd7nmq.mjs");
var Route = createFileRoute("/_authenticated/cvs")({
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
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var ResetPasswordRoute = Route$10.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$11
});
var ForgotPasswordRoute = Route$9.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$11
});
var AuthRoute = Route$8.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$11
});
var AuthenticatedRouteRoute = Route$7.update({
	id: "/_authenticated",
	getParentRoute: () => Route$11
});
var AuthenticatedIndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthCallbackRoute = Route$5.update({
	id: "/callback",
	path: "/callback",
	getParentRoute: () => AuthRoute
});
var AuthenticatedTailorRoute = Route$4.update({
	id: "/tailor",
	path: "/tailor",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProfileRoute = Route$3.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedJobsRoute = Route$2.update({
	id: "/jobs",
	path: "/jobs",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedHistoryRoute = Route$1.update({
	id: "/history",
	path: "/history",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedCvsRoute: Route.update({
		id: "/cvs",
		path: "/cvs",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
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
	ResetPasswordRoute
};
var routeTree = Route$11._addFileChildren(rootRouteChildren)._addFileTypes();
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
