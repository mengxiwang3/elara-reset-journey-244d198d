import orbLg from "@/assets/paper/orb.webp";
import orbSm from "@/assets/paper/orb-sm.webp";

/**
 * Elara's presence: the painted paper orb (ask-elara-paper-orb-v1). It replaces
 * the glossy gold sphere everywhere — Paper at dusk §01.
 *
 * It is an object that sits on the page. It never floats, bounces or spins.
 * On dark paper it may glow, amber only (§04); on light paper it never does.
 * Four states carry an exchange — idle, listening, thinking, replied — and
 * they read through the glow alone. The caller echoes the state in text for
 * screen readers, so the orb itself is decorative.
 */
export type OrbState = "idle" | "listening" | "thinking" | "replied";

export function Orb({
  state = "idle",
  size = 40,
  glow = false,
  className = "",
}: {
  state?: OrbState;
  /** Diameter in px. Chat avatar 32-40, brand moments larger. */
  size?: number;
  /** Only on forest or navy paper. */
  glow?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`e-orb e-orb--${state} ${className}`.trim()}
      style={{ ["--orb" as string]: `${size}px` }}
      aria-hidden
    >
      {glow && <span className="e-orb__glow" />}
      <img
        src={size > 72 ? orbLg : orbSm}
        alt=""
        width={size}
        height={size}
        className="e-orb__img"
        decoding="async"
      />
    </span>
  );
}
