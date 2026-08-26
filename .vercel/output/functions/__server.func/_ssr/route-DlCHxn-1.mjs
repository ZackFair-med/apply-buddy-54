import { o as __toESM } from "../_runtime.mjs";
import { _ as useRouter, f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime, d as Content, f as Description, g as Title, h as Root, m as Portal, p as Overlay, u as Close } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-C19MdsU6.mjs";
import { n as Slot } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as cn, t as Button } from "./button-Dts1Y2ez.mjs";
import { t as Input } from "./input-B2ae_v7j.mjs";
import { _ as FileText, d as LogOut, h as History, l as PanelLeft, m as LayoutDashboard, n as User, o as Sparkles, p as ListTodo, t as X } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-C1nPdEEu.mjs";
import { n as LogoMark, t as ApplyPilotLogo } from "./ApplyPilotLogo-BD61uhC_.mjs";
import { t as getUsageSummary } from "./usage.functions-DSyj1fML.mjs";
import { t as Root$1 } from "../_libs/radix-ui__react-separator.mjs";
import { a as Trigger, i as Root3, n as Portal$1, r as Provider, t as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-DlCHxn-1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
	const [isMobile, setIsMobile] = import_react.useState(void 0);
	import_react.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
var Separator = import_react.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
	...props
}));
Separator.displayName = Root$1.displayName;
var Sheet = Root;
var SheetPortal = Portal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = Overlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Close, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = Content.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = Title.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = Description.displayName;
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)", className),
	...props
}) }));
TooltipContent.displayName = Content2.displayName;
var SIDEBAR_COOKIE_NAME = "sidebar_state";
var SIDEBAR_COOKIE_MAX_AGE = 3600 * 24 * 7;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "b";
var SidebarContext = import_react.createContext(null);
function useSidebar() {
	const context = import_react.useContext(SidebarContext);
	if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
	return context;
}
var SidebarProvider = import_react.forwardRef(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = import_react.useState(false);
	const [_open, _setOpen] = import_react.useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = import_react.useCallback((value) => {
		const openState = typeof value === "function" ? value(open) : value;
		if (setOpenProp) setOpenProp(openState);
		else _setOpen(openState);
		document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
	}, [setOpenProp, open]);
	const toggleSidebar = import_react.useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
	}, [
		isMobile,
		setOpen,
		setOpenMobile
	]);
	import_react.useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggleSidebar();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggleSidebar]);
	const state = open ? "expanded" : "collapsed";
	const contextValue = import_react.useMemo(() => ({
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	}), [
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
			delayDuration: 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					"--sidebar-width": SIDEBAR_WIDTH,
					"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
					...style
				},
				className: cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className),
				ref,
				...props,
				children
			})
		})
	});
});
SidebarProvider.displayName = "SidebarProvider";
var Sidebar = import_react.forwardRef(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
	if (collapsible === "none") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className),
		ref,
		...props,
		children
	});
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: openMobile,
		onOpenChange: setOpenMobile,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			"data-sidebar": "sidebar",
			"data-mobile": "true",
			className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
			style: { "--sidebar-width": SIDEBAR_WIDTH_MOBILE },
			side,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
				className: "sr-only",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Sidebar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Displays the mobile sidebar." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full w-full flex-col",
				children
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "group peer hidden text-sidebar-foreground md:block",
		"data-state": state,
		"data-collapsible": state === "collapsed" ? collapsible : "",
		"data-variant": variant,
		"data-side": side,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex", side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l", className),
			...props,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-sidebar": "sidebar",
				className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
				children
			})
		})]
	});
});
Sidebar.displayName = "Sidebar";
var SidebarTrigger = import_react.forwardRef(({ className, onClick, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		ref,
		"data-sidebar": "trigger",
		variant: "ghost",
		size: "icon",
		className: cn("h-7 w-7", className),
		onClick: (event) => {
			onClick?.(event);
			toggleSidebar();
		},
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Toggle Sidebar"
		})]
	});
});
SidebarTrigger.displayName = "SidebarTrigger";
var SidebarRail = import_react.forwardRef(({ className, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		ref,
		"data-sidebar": "rail",
		"aria-label": "Toggle Sidebar",
		tabIndex: -1,
		onClick: toggleSidebar,
		title: "Toggle Sidebar",
		className: cn("absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex", "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className),
		...props
	});
});
SidebarRail.displayName = "SidebarRail";
var SidebarInset = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		ref,
		className: cn("relative flex w-full flex-1 flex-col bg-background", "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow", className),
		...props
	});
});
SidebarInset.displayName = "SidebarInset";
var SidebarInput = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		ref,
		"data-sidebar": "input",
		className: cn("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className),
		...props
	});
});
SidebarInput.displayName = "SidebarInput";
var SidebarHeader = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "header",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
});
SidebarHeader.displayName = "SidebarHeader";
var SidebarFooter = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "footer",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
});
SidebarFooter.displayName = "SidebarFooter";
var SidebarSeparator = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
		ref,
		"data-sidebar": "separator",
		className: cn("mx-2 w-auto bg-sidebar-border", className),
		...props
	});
});
SidebarSeparator.displayName = "SidebarSeparator";
var SidebarContent = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "content",
		className: cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className),
		...props
	});
});
SidebarContent.displayName = "SidebarContent";
var SidebarGroup = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "group",
		className: cn("relative flex w-full min-w-0 flex-col p-2", className),
		...props
	});
});
SidebarGroup.displayName = "SidebarGroup";
var SidebarGroupLabel = import_react.forwardRef(({ className, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "div", {
		ref,
		"data-sidebar": "group-label",
		className: cn("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className),
		...props
	});
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
var SidebarGroupAction = import_react.forwardRef(({ className, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		"data-sidebar": "group-action",
		className: cn("absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 after:md:hidden", "group-data-[collapsible=icon]:hidden", className),
		...props
	});
});
SidebarGroupAction.displayName = "SidebarGroupAction";
var SidebarGroupContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	"data-sidebar": "group-content",
	className: cn("w-full text-sm", className),
	...props
}));
SidebarGroupContent.displayName = "SidebarGroupContent";
var SidebarMenu = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
	ref,
	"data-sidebar": "menu",
	className: cn("flex w-full min-w-0 flex-col gap-1", className),
	...props
}));
SidebarMenu.displayName = "SidebarMenu";
var SidebarMenuItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
	ref,
	"data-sidebar": "menu-item",
	className: cn("group/menu-item relative", className),
	...props
}));
SidebarMenuItem.displayName = "SidebarMenuItem";
var sidebarMenuButtonVariants = cva("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring cursor-pointer transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
	variants: {
		variant: {
			default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
		},
		size: {
			default: "h-8 text-sm",
			sm: "h-7 text-xs",
			lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var SidebarMenuButton = import_react.forwardRef(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
	const Comp = asChild ? Slot : "button";
	const { isMobile, state } = useSidebar();
	const button = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		ref,
		"data-sidebar": "menu-button",
		"data-size": size,
		"data-active": isActive,
		className: cn(sidebarMenuButtonVariants({
			variant,
			size
		}), className),
		...props
	});
	if (!tooltip) return button;
	if (typeof tooltip === "string") tooltip = { children: tooltip };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: button
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
		side: "right",
		align: "center",
		hidden: state !== "collapsed" || isMobile,
		...tooltip
	})] });
});
SidebarMenuButton.displayName = "SidebarMenuButton";
var SidebarMenuAction = import_react.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		"data-sidebar": "menu-action",
		className: cn("absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 after:md:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0", className),
		...props
	});
});
SidebarMenuAction.displayName = "SidebarMenuAction";
var SidebarMenuBadge = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	"data-sidebar": "menu-badge",
	className: cn("pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className),
	...props
}));
SidebarMenuBadge.displayName = "SidebarMenuBadge";
var SidebarMenuSkeleton = import_react.forwardRef(({ className, showIcon = false, ...props }, ref) => {
	const width = import_react.useMemo(() => {
		return `${Math.floor(Math.random() * 40) + 50}%`;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		"data-sidebar": "menu-skeleton",
		className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
		...props,
		children: [showIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
			className: "size-4 rounded-md",
			"data-sidebar": "menu-skeleton-icon"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
			className: "h-4 max-w-(--skeleton-width) flex-1",
			"data-sidebar": "menu-skeleton-text",
			style: { "--skeleton-width": width }
		})]
	});
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
var SidebarMenuSub = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
	ref,
	"data-sidebar": "menu-sub",
	className: cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className),
	...props
}));
SidebarMenuSub.displayName = "SidebarMenuSub";
var SidebarMenuSubItem = import_react.forwardRef(({ ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
	ref,
	...props
}));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
var SidebarMenuSubButton = import_react.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "a", {
		ref,
		"data-sidebar": "menu-sub-button",
		"data-size": size,
		"data-active": isActive,
		className: cn("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className),
		...props
	});
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
var mainItems = [
	{
		to: "/",
		label: "Dashboard",
		icon: LayoutDashboard,
		exact: true
	},
	{
		to: "/jobs",
		label: "Tracker",
		icon: ListTodo,
		exact: false
	},
	{
		to: "/tailor",
		label: "AI Assistant",
		icon: Sparkles,
		exact: false
	},
	{
		to: "/cvs",
		label: "CVs",
		icon: FileText,
		exact: false
	}
];
var footerItems = [{
	to: "/profile",
	label: "Profile",
	icon: User
}];
function AppNav() {
	const router = useRouter();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const usageFn = useServerFn(getUsageSummary);
	const { data: usage } = useQuery({
		queryKey: ["usage-summary"],
		queryFn: () => usageFn(),
		staleTime: 6e4
	});
	const isPaid = usage?.plan === "paid";
	const isActive = (to, exact) => exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			toast.error(error.message || "Sign out failed");
			return;
		}
		router.navigate({ to: "/auth" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sidebar, {
		collapsible: "icon",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-2 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						"aria-label": "ApplyPilot dashboard",
						className: "group-data-[collapsible=icon]:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyPilotLogo, {
							markClassName: "h-7 w-7",
							wordmarkClassName: "text-base text-sidebar-foreground"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						"aria-label": "ApplyPilot dashboard",
						className: "hidden items-center justify-center group-data-[collapsible=icon]:flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "h-7 w-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger, { className: "hidden text-sidebar-foreground/50 hover:text-sidebar-foreground md:flex" })
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarGroupContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenu, { children: [mainItems.map(({ to, label, icon: Icon, exact }) => {
				const active = isActive(to, exact);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuButton, {
					asChild: true,
					isActive: active,
					tooltip: label,
					className: active ? "border-l-2 border-sidebar-primary rounded-l-none pl-[calc(0.5rem-2px)] text-sidebar-foreground font-medium bg-sidebar-accent" : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-4 w-4 ${active ? "text-sidebar-primary" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
					})
				}) }, to);
			}), isPaid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: (() => {
				const active = isActive("/history", false);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuButton, {
					asChild: true,
					isActive: active,
					tooltip: "History",
					className: active ? "border-l-2 border-sidebar-primary rounded-l-none pl-[calc(0.5rem-2px)] text-sidebar-foreground font-medium bg-sidebar-accent" : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/history",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: `h-4 w-4 ${active ? "text-sidebar-primary" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "History" })]
					})
				});
			})() })] }) }) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenu, { children: [footerItems.map(({ to, label, icon: Icon }) => {
				const active = isActive(to, false);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuButton, {
					asChild: true,
					isActive: active,
					tooltip: label,
					className: active ? "border-l-2 border-sidebar-primary rounded-l-none pl-[calc(0.5rem-2px)] text-sidebar-foreground font-medium bg-sidebar-accent" : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-4 w-4 ${active ? "text-sidebar-primary" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
					})
				}) }, to);
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenuButton, {
				onClick: signOut,
				tooltip: "Sign out",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sign out" })]
			}) })] }) })
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex min-h-screen w-full bg-background text-foreground",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex h-14 shrink-0 items-center justify-between border-b border-border px-3 md:hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyPilotLogo, {
					markClassName: "h-7 w-7",
					wordmarkClassName: "text-base"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-8",
					"aria-hidden": "true"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-5xl px-5 py-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			})
		})]
	})]
}) });
//#endregion
export { SplitComponent as component };
