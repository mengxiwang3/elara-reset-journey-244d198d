const AVATARS = ["S", "A", "M", "R"];

/**
 * Overlapping member-avatar stack used as social proof beside the community
 * metric. Neutral circles with initials (not stock photos), plus a "+"
 * chip implying the wider community.
 */
export function MemberAvatars({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`.trim()} aria-hidden>
      {AVATARS.map((a, idx) => (
        <span
          key={a}
          className={`h-8 w-8 rounded-full bg-card border border-border ring-2 ring-background grid place-items-center font-sans text-xs text-foreground ${idx > 0 ? "-ml-2.5" : ""}`}
        >
          {a}
        </span>
      ))}
      <span className="-ml-2.5 h-8 w-8 rounded-full bg-secondary text-accent ring-2 ring-background grid place-items-center text-[11px] font-semibold">
        +
      </span>
    </div>
  );
}
