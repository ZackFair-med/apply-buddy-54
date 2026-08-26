import type { HTMLAttributes } from "react";

type LogoProps = HTMLAttributes<HTMLSpanElement> & {
  showWordmark?: boolean;
  markClassName?: string;
  wordmarkClassName?: string;
};

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="12" fill="#1F4D3D" />
      <path
        d="M12.5 34.5 23.5 12l11 22.5M17.1 26h12.8"
        stroke="#FBFBF9"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.5 16.5c5.4.2 8.4-1.8 10.2-5.2"
        stroke="#D2A663"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="m34.1 10.4 4.5-1.1-1.2 4.5" fill="#D2A663" />
    </svg>
  );
}

export function ApplyPilotLogo({
  showWordmark = true,
  markClassName,
  wordmarkClassName,
  className = "",
  ...props
}: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="ApplyPilot"
      {...props}
    >
      <LogoMark className={markClassName} />
      {showWordmark && (
        <span
          className={`font-serif text-xl font-semibold tracking-[-0.025em] ${wordmarkClassName ?? ""}`}
        >
          ApplyPilot
        </span>
      )}
    </span>
  );
}
