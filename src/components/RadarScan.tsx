interface RadarScanProps {
  size?: number;
}

export default function RadarScan({ size = 280 }: RadarScanProps) {
  const cx = 150;
  const cy = 150;
  const maxR = 140;

  const rings = [35, 70, 105, maxR];
  const signalPoints = [
    { x: 95, y: 80, delay: "0s" },
    { x: 200, y: 120, delay: "0.5s" },
    { x: 130, y: 190, delay: "1s" },
    { x: 210, y: 200, delay: "1.5s" },
    { x: 80, y: 160, delay: "0.3s" },
    { x: 170, y: 90, delay: "0.8s" },
  ];

  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      className="overflow-visible"
    >
      <defs>
        <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.08" />
          <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sweep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
          <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
        </linearGradient>
        <filter id="radar-blur">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>

      {/* Background glow */}
      <circle cx={cx} cy={cy} r={maxR + 10} fill="url(#radar-glow)" />

      {/* Coordinate markings — tick marks around the outer ring */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i * 10 * Math.PI) / 180;
        const isMajor = i % 3 === 0;
        const inner = isMajor ? maxR - 8 : maxR - 4;
        const outer = maxR;
        const x1 = cx + inner * Math.cos(angle);
        const y1 = cy + inner * Math.sin(angle);
        const x2 = cx + outer * Math.cos(angle);
        const y2 = cy + outer * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isMajor ? "#0891b2" : "#155e75"}
            strokeWidth={isMajor ? 1.5 : 0.8}
            opacity={isMajor ? 0.5 : 0.25}
          />
        );
      })}

      {/* Cardinal coordinate labels */}
      <text x={cx} y={cy - maxR - 6} textAnchor="middle" className="fill-cyan-700 animate-blink-slow" style={{ fontSize: 8, fontFamily: "monospace" }}>N</text>
      <text x={cx + maxR + 10} y={cy + 3} textAnchor="middle" className="fill-cyan-700 animate-blink-slow" style={{ fontSize: 8, fontFamily: "monospace" }}>E</text>
      <text x={cx} y={cy + maxR + 12} textAnchor="middle" className="fill-cyan-700 animate-blink-slow" style={{ fontSize: 8, fontFamily: "monospace" }}>S</text>
      <text x={cx - maxR - 10} y={cy + 3} textAnchor="middle" className="fill-cyan-700 animate-blink-slow" style={{ fontSize: 8, fontFamily: "monospace" }}>W</text>

      {/* Concentric rings */}
      {rings.map((r, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#0e7490"
          strokeWidth={1}
          opacity={0.3 - i * 0.04}
        />
      ))}

      {/* Cross-hair grid lines */}
      <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="#0e7490" strokeWidth={0.5} opacity={0.2} />
      <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="#0e7490" strokeWidth={0.5} opacity={0.2} />
      <line x1={cx - maxR * 0.707} y1={cy - maxR * 0.707} x2={cx + maxR * 0.707} y2={cy + maxR * 0.707} stroke="#0e7490" strokeWidth={0.5} opacity={0.15} />
      <line x1={cx + maxR * 0.707} y1={cy - maxR * 0.707} x2={cx - maxR * 0.707} y2={cy + maxR * 0.707} stroke="#0e7490" strokeWidth={0.5} opacity={0.15} />

      {/* Pulsing ring */}
      <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="#22d3ee" strokeWidth={1.5} className="animate-ring-pulse" style={{ transformOrigin: "center" }} />

      {/* Rotating sweep */}
      <g className="animate-radar-sweep" style={{ transformOrigin: "150px 150px" }}>
        {/* Sweep sector — a wedge from center */}
        <path
          d={`M ${cx} ${cy} L ${cx + maxR} ${cy} A ${maxR} ${maxR} 0 0 0 ${cx + maxR * Math.cos(-Math.PI / 3)} ${cy + maxR * Math.sin(-Math.PI / 3)} Z`}
          fill="url(#sweep-grad)"
        />
        {/* Sweep line */}
        <line x1={cx} y1={cy} x2={cx + maxR} y2={cy} stroke="#22d3ee" strokeWidth={1.5} opacity={0.6} />
      </g>

      {/* Signal points */}
      {signalPoints.map((pt, i) => (
        <g key={i}>
          <circle
            cx={pt.x}
            cy={pt.y}
            r={3}
            fill="#22d3ee"
            className="animate-signal-pulse"
            style={{ animationDelay: pt.delay, transformOrigin: `${pt.x}px ${pt.y}px` }}
          />
          <circle
            cx={pt.x}
            cy={pt.y}
            r={6}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={0.5}
            opacity={0.3}
            className="animate-signal-pulse"
            style={{ animationDelay: pt.delay, transformOrigin: `${pt.x}px ${pt.y}px` }}
          />
        </g>
      ))}

      {/* Center point */}
      <circle cx={cx} cy={cy} r={4} fill="#22d3ee" opacity={0.9} />
      <circle cx={cx} cy={cy} r={8} fill="none" stroke="#22d3ee" strokeWidth={1} opacity={0.4} className="animate-glow-pulse" />
    </svg>
  );
}
