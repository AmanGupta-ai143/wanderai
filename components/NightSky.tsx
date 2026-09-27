// Deterministic pseudo-random (same output on server and client) so star
// positions don't cause a hydration mismatch — no Math.random() at render.
function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const STAR_COUNT = 220;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
  const size = 1 + seeded(i * 5.3) * 2.2; // 1–3.2px
  return {
    top: seeded(i * 3.1) * 92, // keep clear of the very bottom edge
    left: seeded(i * 7.7) * 100,
    size,
    bright: size > 2.4, // a handful of bigger, glowier stars
    delay: seeded(i * 2.9) * 6,
    duration: 2.2 + seeded(i * 4.1) * 3.2,
  };
});

export default function NightSky() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: s.bright
              ? "0 0 6px 1px rgba(255,255,255,0.65)"
              : undefined,
          }}
        />
      ))}
    </div>
  );
}
