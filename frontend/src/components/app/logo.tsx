// A small SVG mark instead of a plain "IT" text box. Renders crisp at any
// size since it's vector, no image asset to ship.
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="var(--color-sidebar-primary, #1F4E79)" />
      <circle cx="12" cy="12" r="3.2" fill="white" fillOpacity="0.55" />
      <circle cx="28" cy="12" r="3.2" fill="white" fillOpacity="0.55" />
      <circle cx="20" cy="27" r="3.6" fill="white" />
      <path d="M13.6 14.2 L18.2 24.4" stroke="white" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M26.4 14.2 L21.8 24.4" stroke="white" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 12 L28 12" stroke="white" strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = 36, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} />
      {showWordmark && (
        <div>
          <p className="text-sm font-semibold leading-none"></p>
          <p className="text-[11px] text-sidebar-foreground/60"></p>
        </div>
      )}
    </div>
  );
}