import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Brain,
  CheckCircle2,
  Cpu,
  Radar,
  ShieldCheck,
  Signal,
  User,
  Zap,
} from "lucide-react";
import RadarScan from "@/components/RadarScan";
import type { CustomerFormInput } from "@/types/churn";

const STAGES = [
  "INITIALIZING ANALYSIS",
  "VALIDATING CUSTOMER PROFILE",
  "PROCESSING BEHAVIORAL SIGNALS",
  "EVALUATING CHURN PATTERNS",
  "RUNNING RISK CLASSIFICATION",
  "GENERATING RISK ASSESSMENT",
];

const STAGE_DURATION = 500;

interface ProcessingScreenProps {
  customerData: CustomerFormInput;
  complete: boolean;
  onComplete: () => void;
}

export default function ProcessingScreen({
  customerData,
  complete,
  onComplete,
}: ProcessingScreenProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Progress animation — driven by elapsed time, capped at 90% until API responds
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setProgress(complete ? 100 : 50);
      return;
    }

    startTimeRef.current = null;

    function tick(now: number) {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const targetProgress = complete ? 100 : Math.min((elapsed / (STAGES.length * STAGE_DURATION)) * 90, 90);
      setProgress(targetProgress);

      const stageIndex = Math.min(
        Math.floor((targetProgress / 100) * STAGES.length),
        STAGES.length - 1
      );
      setCurrentStage(complete ? STAGES.length - 1 : stageIndex);

      if (!complete && targetProgress < 90) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (complete && targetProgress >= 100) {
        setProgress(100);
        setCurrentStage(STAGES.length - 1);
        setTimeout(onComplete, 600);
      } else if (complete) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Hold at 90% — keep ticking to check if complete changes
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [complete, onComplete]);

  const telemetryItems = [
    { label: "CUSTOMER SIGNAL", value: "ANALYZING", icon: Signal, color: "text-cyan-400" },
    { label: "PROFILE / AGE", value: `${customerData.age}`, icon: User, color: "text-slate-300" },
    { label: "TENURE", value: `${customerData.tenureMonths} MONTHS`, icon: Activity, color: "text-slate-300" },
    { label: "USAGE SIGNAL", value: "ACTIVE", icon: Zap, color: "text-emerald-400" },
    { label: "COMPLAINT SIGNAL", value: `${customerData.totalComplaints} TOTAL`, icon: ShieldCheck, color: customerData.totalComplaints > 0 ? "text-amber-400" : "text-emerald-400" },
    { label: "MODEL", value: "RANDOM FOREST", icon: Brain, color: "text-slate-300" },
    { label: "FEATURE VECTOR", value: "14 DIMENSIONS", icon: Cpu, color: "text-slate-300" },
    { label: "SYSTEM STATUS", value: complete ? "COMPLETE" : "SCANNING", icon: Radar, color: complete ? "text-emerald-400" : "text-cyan-400" },
  ];

  return (
    <div className="animate-fade-in rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900/50 p-6 sm:p-8">
      {/* Header bar */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
            <Radar className="h-4.5 w-4.5 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-slate-200">
              {complete ? "CLASSIFICATION COMPLETE" : "SCANNING CUSTOMER SIGNALS"}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              ChurnSense AI — Risk Intelligence Command Center
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${complete ? "bg-emerald-400" : "bg-cyan-400 animate-status-pulse"}`} style={{ color: complete ? "#34d399" : "#22d3ee" }} />
          <span className={`text-xs font-mono ${complete ? "text-emerald-400" : "text-cyan-400"}`}>
            {complete ? "ONLINE" : "ACTIVE"}
          </span>
        </div>
      </div>

      {/* Main content: radar + telemetry */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Radar */}
        <div className="flex justify-center lg:col-span-2">
          <div className="relative flex items-center justify-center">
            <RadarScan size={260} />
            {complete && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-scale-in">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Telemetry panel */}
        <div className="lg:col-span-3 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {telemetryItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${item.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[9px] uppercase tracking-widest text-slate-500">
                      {item.label}
                    </div>
                    <div className={`truncate font-mono text-xs font-semibold ${item.color}`}>
                      {item.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stage list */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-3 text-[10px] uppercase tracking-widest text-slate-500">
              Analysis Stages
            </div>
            <div className="space-y-1.5">
              {STAGES.map((stage, i) => {
                const isDone = complete || i < currentStage;
                const isActive = !complete && i === currentStage;
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-slate-600 w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                    ) : isActive ? (
                      <span className="h-3 w-3 shrink-0 rounded-full border border-cyan-400 border-t-transparent animate-radar-sweep" style={{ animationDuration: "0.8s" }} />
                    ) : (
                      <span className="h-3 w-3 shrink-0 rounded-full border border-slate-700" />
                    )}
                    <span
                      className={`text-xs font-mono tracking-wide ${
                        isDone
                          ? "text-slate-400"
                          : isActive
                          ? "text-cyan-300"
                          : "text-slate-600"
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">
            Analysis Progress
          </span>
          <span className="font-mono text-xs text-cyan-400 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
