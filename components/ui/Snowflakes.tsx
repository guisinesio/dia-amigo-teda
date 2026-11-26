interface SnowflakesProps {
  count?: number;
  opacity?: number;
}

const FLAKE_DATA = [
  { left: "8%",  delay: "0s",    duration: "7s",   size: "0.9rem" },
  { left: "18%", delay: "1.4s",  duration: "5.5s", size: "0.65rem" },
  { left: "29%", delay: "0.6s",  duration: "8s",   size: "0.8rem" },
  { left: "41%", delay: "2.1s",  duration: "6.5s", size: "0.55rem" },
  { left: "53%", delay: "0.3s",  duration: "7.5s", size: "1rem" },
  { left: "63%", delay: "1.8s",  duration: "5s",   size: "0.7rem" },
  { left: "74%", delay: "0.9s",  duration: "9s",   size: "0.6rem" },
  { left: "85%", delay: "2.5s",  duration: "6s",   size: "0.85rem" },
  { left: "92%", delay: "1.1s",  duration: "7.2s", size: "0.5rem" },
  { left: "35%", delay: "3s",    duration: "8.5s", size: "0.75rem" },
];

export function Snowflakes({ count = 8, opacity = 0.6 }: SnowflakesProps) {
  return (
    <>
      {FLAKE_DATA.slice(0, count).map((f, i) => (
        <span
          key={i}
          className="christmas-flake"
          style={{
            left: f.left,
            animationDelay: f.delay,
            animationDuration: f.duration,
            fontSize: f.size,
            color: `rgba(255,255,255,${opacity})`,
          }}
        >
          ❄
        </span>
      ))}
    </>
  );
}
