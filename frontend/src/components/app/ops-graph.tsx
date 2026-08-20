// The login page's signature visual: a small live-looking network topology,
// grounded in what ITOMS actually is (a system for watching over IT
// infrastructure) rather than decorative abstract shapes. Nodes pulse like
// heartbeat/status pings; a few "packets" travel along the connecting
// lines via native SVG motion-path animation (no JS animation loop needed).
const NODES: [number, number][] = [
  [40, 60], [140, 28], [232, 66], [332, 40],
  [92, 158], [212, 190], [322, 148], [172, 232],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [4, 5], [5, 6], [5, 7], [6, 3],
];

const PACKET_EDGES = [0, 2, 4, 6, 8];

export function OpsGraph({ animate = true }: { animate?: boolean }) {
  return (
    <svg viewBox="0 0 372 260" className="h-full w-full" aria-hidden="true">
      {EDGES.map(([a, b], i) => {
        const [x1, y1] = NODES[a];
        const [x2, y2] = NODES[b];
        return (
          <path
            key={i}
            id={`login-edge-${i}`}
            d={`M ${x1} ${y1} L ${x2} ${y2}`}
            stroke="rgba(148,178,255,0.22)"
            strokeWidth="1"
            fill="none"
          />
        );
      })}
      {animate &&
        PACKET_EDGES.map((edgeIdx, i) => (
          <circle key={i} r="2.4" fill="#34D8C6" opacity="0.9">
            <animateMotion
              dur={`${3.2 + i * 0.6}s`}
              repeatCount="indefinite"
              begin={`${i * 0.7}s`}
            >
              <mpath href={`#login-edge-${edgeIdx}`} />
            </animateMotion>
          </circle>
        ))}
      {NODES.map(([x, y], i) => (
        <g key={i} className={animate ? "login-node-pulse" : ""} style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${i * 0.35}s` }}>
          <circle cx={x} cy={y} r="7" fill="#34D8C6" opacity="0.12" />
          <circle cx={x} cy={y} r="3" fill="#34D8C6" />
        </g>
      ))}
    </svg>
  );
}