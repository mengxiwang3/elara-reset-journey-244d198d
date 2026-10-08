import orbSm from "@/assets/paper/orb-sm.webp";

/**
 * The lockup. Paper at dusk §01: the painted orb is Elara, and the wordmark is
 * lowercase Fraunces semibold, always set beside the orb — never the word alone
 * on a product surface.
 *
 *   · Horizontal is the default lockup.
 *   · Orb height ≈ 1.15× cap height, so it sits level with the ascenders.
 *   · Forest #1F3A2E on light paper; soft cream #F3EADB on forest or navy.
 *   · Clear space is ¼ orb diameter — callers pad, the lockup doesn't.
 *   · No recolouring, rings, gloss or cropping of the orb.
 */
export function Wordmark({
  size = 30,
  onDark = false,
  className = "",
}: {
  /** Wordmark font size in px. The orb scales from it. */
  size?: number;
  onDark?: boolean;
  className?: string;
}) {
  const orb = Math.round(size * 0.86);
  return (
    <span
      className={`inline-flex items-center ${className}`.trim()}
      style={{ gap: `${Math.round(size * 0.28)}px` }}
      role="img"
      aria-label="Elara"
    >
      <img
        src={orbSm}
        alt=""
        width={orb}
        height={orb}
        className="shrink-0"
        style={{ width: orb, height: orb }}
        aria-hidden
      />
      <span
        aria-hidden
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 600,
          fontSize: `${size}px`,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: onDark ? "var(--on-dark)" : "var(--forest-800)",
          // Fraunces sits a touch high against a circle; settle it on the orb.
          transform: "translateY(-0.04em)",
        }}
      >
        elara
      </span>
    </span>
  );
}
