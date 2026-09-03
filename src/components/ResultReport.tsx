import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Signal,
  TrendingDown,
  User,
  Zap,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import type { ChurnPredictionResponse, CustomerFormInput } from "@/types/churn";

interface ResultReportProps {
  result: ChurnPredictionResponse;
  customerData: CustomerFormInput;
  onAnalyzeAnother: () => void;
}

type RiskColor = "emerald" | "amber" | "red";

function getRiskColor(riskLevel: string): RiskColor {
  if (riskLevel === "High") return "red";
  if (riskLevel === "Medium") return "amber";
  return "emerald";
}

const COLOR_MAP: Record<RiskColor, {
  text: string;
  bg: string;
  border: string;
  gradient: string;
  glow: string;
  icon: typeof ShieldCheck;
}> = {
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    gradient: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/20",
    icon: ShieldCheck,
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/20",
    icon: ShieldAlert,
  },
  red: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    gradient: "from-red-400 to-rose-500",
    glow: "shadow-red-500/20",
    icon: ShieldAlert,
  },
};

export default function ResultReport({
  result,
  customerData,
  onAnalyzeAnother,
}: ResultReportProps) {
  const isChurn = result.churn_prediction === 1;
  const riskColor = getRiskColor(result.risk_level);
  const c = COLOR_MAP[riskColor];
  const RiskIcon = c.icon;

  const animatedProb = useCountUp(result.churn_probability, 1500, true);

  // Risk meter — semi-circular gauge
  const meterAngle = (result.churn_probability / 100) * 180;

  // Key customer signals
  const signals: { label: string; value: string; icon: typeof Activity; tone: "neutral" | "warning" | "positive" }[] = [
    { label: "Age", value: `${customerData.age}`, icon: User, tone: "neutral" },
    { label: "Tenure", value: `${customerData.tenureMonths} months`, icon: Clock, tone: "neutral" },
    { label: "Monthly Charges", value: `$${customerData.monthlyCharges}`, icon: FileText, tone: "neutral" },
    { label: "Call Minutes", value: `${customerData.avgCallMinutes}/mo`, icon: Phone, tone: "neutral" },
    { label: "Data Usage", value: `${customerData.avgDataUsageGB} GB/mo`, icon: Zap, tone: "neutral" },
    { label: "Total Complaints", value: `${customerData.totalComplaints}`, icon: AlertTriangle, tone: customerData.totalComplaints > 3 ? "warning" : "positive" },
    { label: "Max Complaints/Month", value: `${customerData.maxComplaints}`, icon: AlertTriangle, tone: customerData.maxComplaints > 1 ? "warning" : "positive" },
    { label: "Contract", value: customerData.contractType, icon: FileText, tone: customerData.contractType === "Monthly" ? "warning" : "positive" },
  ];

  // Recommended action
  const recommendation =
    riskColor === "red"
      ? "Immediate retention action required. Assign a personal account manager and offer targeted incentives to reduce churn risk."
      : riskColor === "amber"
      ? "Proactive outreach recommended. Offer loyalty rewards or contract upgrades to improve retention probability."
      : "Monitor periodically. Maintain standard engagement and continue loyalty programs.";

  return (
    <div className="space-y-4">
      {/* Header — Intelligence Briefing */}
      <div className="animate-fade-in flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
            <FileText className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-slate-200">
              Customer Risk Intelligence Report
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              ChurnSense AI — Assessment Ready
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${c.bg.replace("/10", "")} animate-status-pulse`} style={{ color: result.risk_level === "High" ? "#f87171" : result.risk_level === "Medium" ? "#fbbf24" : "#34d399" }} />
          <span className="text-xs font-mono text-slate-400">REPORT GENERATED</span>
        </div>
      </div>

      {/* Verdict card */}
      <div className={`animate-scale-in flex items-center gap-4 rounded-2xl border ${c.border} ${c.bg} p-6 shadow-lg ${c.glow}`}>
        <RiskIcon className={`h-12 w-12 ${c.text}`} />
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            Prediction
          </div>
          <div className={`text-2xl font-bold ${c.text}`}>
            {isChurn ? "LIKELY TO CHURN" : "LIKELY TO STAY"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            Classification
          </div>
          <div className={`text-lg font-bold ${c.text}`}>
            {result.risk_level.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Probability + Risk meter */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Probability with count-up */}
        <div className="animate-fade-in-up rounded-2xl border border-slate-800 bg-slate-900/50 p-6" style={{ animationDelay: "100ms" }}>
          <div className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">
            Churn Probability
          </div>
          <div className={`text-5xl font-bold ${c.text} tabular-nums`}>
            {animatedProb.toFixed(2)}%
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${c.gradient} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(result.churn_probability, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-mono text-slate-600">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Risk meter gauge */}
        <div className="animate-fade-in-up rounded-2xl border border-slate-800 bg-slate-900/50 p-6" style={{ animationDelay: "200ms" }}>
          <div className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">
            Risk Meter
          </div>
          <div className="flex items-center justify-center pt-2">
            <RiskGauge angle={meterAngle} color={riskColor} />
          </div>
        </div>
      </div>

      {/* Key customer signals */}
      <div className="animate-fade-in-up rounded-2xl border border-slate-800 bg-slate-900/50 p-6" style={{ animationDelay: "300ms" }}>
        <div className="mb-4 flex items-center gap-2">
          <Signal className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">
            Key Customer Signals
          </h3>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map((s, i) => {
            const Icon = s.icon;
            const toneColor =
              s.tone === "warning"
                ? "text-amber-400"
                : s.tone === "positive"
                ? "text-emerald-400"
                : "text-slate-300";
            return (
              <div
                key={i}
                className="animate-fade-in-up rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5"
                style={{ animationDelay: `${350 + i * 50}ms` }}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3 w-3 ${toneColor}`} />
                  <span className="text-[9px] uppercase tracking-widest text-slate-500">
                    {s.label}
                  </span>
                </div>
                <div className={`mt-1 font-mono text-sm font-semibold ${toneColor}`}>
                  {s.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer profile summary */}
      <div className="animate-fade-in-up rounded-2xl border border-slate-800 bg-slate-900/50 p-6" style={{ animationDelay: "400ms" }}>
        <div className="mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">
            Customer Profile Summary
          </h3>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <ProfileItem label="Gender" value={customerData.gender} />
          <ProfileItem label="Region" value={customerData.region} />
          <ProfileItem label="Contract Type" value={customerData.contractType} />
          <ProfileItem label="Avg SMS / Month" value={`${customerData.avgSMSCount}`} />
          <ProfileItem label="Avg Complaints" value={`${(customerData.totalComplaints / 12).toFixed(2)}`} />
          <ProfileItem label="Feature Vector" value="14 dimensions" />
        </div>
      </div>

      {/* Recommended action */}
      <div className={`animate-fade-in-up rounded-2xl border ${c.border} ${c.bg} p-6`} style={{ animationDelay: "500ms" }}>
        <div className="mb-3 flex items-center gap-2">
          {isChurn ? (
            <TrendingDown className={`h-4 w-4 ${c.text}`} />
          ) : (
            <CheckCircle2 className={`h-4 w-4 ${c.text}`} />
          )}
          <h3 className={`text-sm font-semibold tracking-wide ${c.text}`}>
            Recommended Action
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">{recommendation}</p>
      </div>

      {/* Action button */}
      <div className="animate-fade-in-up pt-2" style={{ animationDelay: "600ms" }}>
        <button
          onClick={onAnalyzeAnother}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-transform hover:scale-[1.02]"
        >
          <RefreshCw className="h-4 w-4" />
          Analyze Another Customer
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Risk Gauge ───────────────────────── */

function RiskGauge({ angle, color }: { angle: number; color: RiskColor }) {
  const colorMap: Record<RiskColor, string> = {
    emerald: "#34d399",
    amber: "#fbbf24",
    red: "#f87171",
  };
  const stroke = colorMap[color];
  const r = 70;
  const cx = 90;
  const cy = 80;
  const arcLength = (angle / 180) * Math.PI;
  const endX = cx + r * Math.cos(Math.PI - arcLength);
  const endY = cy - r * Math.sin(Math.PI - arcLength);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <svg viewBox="0 0 180 100" width="180" height="100">
      {/* Background arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#1e293b"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Tick marks */}
      {[0, 45, 90, 135, 180].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = cx + (r - 14) * Math.cos(Math.PI - rad);
        const y1 = cy - (r - 14) * Math.sin(Math.PI - rad);
        const x2 = cx + (r - 6) * Math.cos(Math.PI - rad);
        const y2 = cy - (r - 6) * Math.sin(Math.PI - rad);
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#334155"
            strokeWidth="1.5"
          />
        );
      })}
      {/* Active arc */}
      {angle > 0 && (
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          style={{ transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      )}
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r - 18) * Math.cos(Math.PI - arcLength)}
        y2={cy - (r - 18) * Math.sin(Math.PI - arcLength)}
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        style={{ transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
      <circle cx={cx} cy={cy} r="5" fill={stroke} />
      {/* Labels */}
      <text x={cx - r} y={cy + 18} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 8, fontFamily: "monospace" }}>LOW</text>
      <text x={cx} y={cy - r - 4} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 8, fontFamily: "monospace" }}>MED</text>
      <text x={cx + r} y={cy + 18} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 8, fontFamily: "monospace" }}>HIGH</text>
    </svg>
  );
}

/* ───────────────────────── Profile Item ───────────────────────── */

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-mono text-sm text-slate-200">{value}</span>
    </div>
  );
}
