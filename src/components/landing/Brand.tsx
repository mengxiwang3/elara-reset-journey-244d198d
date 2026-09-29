/** The forest disc identifies the brand; the orb identifies Elara speaking. */
export function BrandMark() {
  return (
    <span className="inline-flex items-center gap-2.5 font-sans text-2xl font-bold tracking-tight text-foreground">
      <img src="/elara-mark.svg" width="32" height="32" alt="" aria-hidden="true" />
      elara
    </span>
  );
}

/** 28px avatar: a 0.44× gold sphere in a white well, without a ring or dot. */
export function ElaraOrb() {
  return <span className="elara-orb" aria-hidden="true"><span /></span>;
}
