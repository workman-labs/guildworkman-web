"use client";

import { HiCheck } from "react-icons/hi";
import { FaSpinner } from "react-icons/fa6";
import Badge from "@/components/ui/Badge";
import { useHydrated } from "./useHydrated";
import {
  ACTION_PENDING_LABELS,
  STATUS_TONE,
  type TimelineNode,
} from "@/lib/escrowTimeline";

interface EscrowTimelineProps {
  nodes: TimelineNode[];
}

function DotConnector({ isLast }: { isLast: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute left-[13px] top-7 w-px bg-line ${isLast ? "hidden" : "bottom-0"}`}
    />
  );
}

export default function EscrowTimeline({ nodes }: EscrowTimelineProps) {
  const mounted = useHydrated();

  return (
    <ol className="relative" aria-label="Escrow status timeline">
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        const isOptimistic = node.phase === "optimistic";
        const tone = STATUS_TONE[node.status];

        return (
          <li
            key={`${node.status}-${node.at}-${node.phase}`}
            className="relative flex gap-4 pb-7 last:pb-0"
            {...(isOptimistic ? { role: "status", "aria-live": "polite" } : {})}
          >
            <DotConnector isLast={isLast} />

            {/* Rail dot: a check for confirmed steps, a spinner for the
                optimistic in-flight one. */}
            <span
              aria-hidden
              className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                isOptimistic
                  ? "animate-pulse border-gold bg-gold/15 text-gold-deep"
                  : "border-transparent bg-navy text-white"
              }`}
            >
              {isOptimistic ? <FaSpinner className="animate-spin text-xs" /> : <HiCheck className="text-sm" />}
            </span>

            <div className={`min-w-0 flex-1 ${isOptimistic ? "opacity-90" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={tone}>{node.label}</Badge>
                {isOptimistic && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-deep">
                    {ACTION_PENDING_LABELS[node.action ?? "release"]}
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-sm text-muted">{node.description}</p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                {isOptimistic ? (
                  <span>Awaiting on-chain confirmation…</span>
                ) : (
                  <time dateTime={node.at}>{mounted ? new Date(node.at).toLocaleString() : ""}</time>
                )}
                {node.txHash && (
                  <span className="font-mono text-navy-2" title={node.txHash}>
                    tx&nbsp;{node.txHash.slice(0, 8)}…{node.txHash.slice(-6)}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
