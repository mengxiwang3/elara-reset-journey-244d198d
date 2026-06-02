const AVATARS = [
  { g: "from-[#C0795C] to-[#B0543A]", i: "S" },
  { g: "from-[#CE9E55] to-[#BF8A49]", i: "A" },
  { g: "from-[#9C8067] to-[#5B4B3F]", i: "M" },
  { g: "from-[#C58467] to-[#9A4530]", i: "R" },
];

/**
 * Overlapping member-avatar stack used as social proof beside the community
 * metric. Brand-gradient circles with initials (not stock photos), plus a "+"
 * chip implying the wider community.
 */
export function MemberAvatars({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`.trim()} aria-hidden>
      {AVATARS.map((a, idx) => (
        <span
          key={a.i}
          className={`h-8 w-8 rounded-full bg-gradient-to-br ${a.g} ring-2 ring-background grid place-items-center font-serif text-xs text-white shadow-sm ${idx > 0 ? "-ml-2.5" : ""}`}
        >
          {a.i}
        </span>
      ))}
      <span className="-ml-2.5 h-8 w-8 rounded-full bg-primary text-primary-foreground ring-2 ring-background grid place-items-center text-[11px] font-semibold">
        +
      </span>
    </div>
  );
}
