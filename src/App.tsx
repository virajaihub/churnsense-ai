import { useState } from "react";
import {
  Activity,
  Brain,
  ChartBar,
  Info,
  LineChart,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  Users,
  X,
  Zap,
} from "lucide-react";
import RiskAnalyzer from "@/components/RiskAnalyzer";
import type { SectionId } from "@/types/churn";

const SECTIONS: { id: SectionId; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "analyzer", label: "Risk Analyzer", icon: Target },
  { id: "model", label: "Model Intelligence", icon: Brain },
  { id: "insights", label: "Insights", icon: LineChart },
  { id: "about", label: "About", icon: Info },
];

export default function App() {
  const [active, setActive] = useState<SectionId>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setActive("overview")}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              ChurnSense <span className="text-cyan-400">AI</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="border-t border-slate-800/60 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActive(s.id);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-300"
                        : "text-slate-400 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {active === "overview" && <Overview onAnalyze={() => setActive("analyzer")} onShowModel={() => setActive("model")} />}
        {active === "analyzer" && <RiskAnalyzer />}
        {active === "model" && <ModelIntelligence />}
        {active === "insights" && <Insights />}
        {active === "about" && <About />}
      </main>

      <footer className="border-t border-slate-800/60 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          ChurnSense AI — Predictive customer retention intelligence powered by a
          Random Forest model.
        </div>
      </footer>
    </div>
  );
}

/* ───────────────────────── Overview ───────────────────────── */

function Overview({
  onAnalyze,
  onShowModel,
}: {
  onAnalyze: () => void;
  onShowModel: () => void;
}) {
  const stats = [
    { label: "Customers Analyzed", value: "10,000", icon: Users },
    { label: "Model Features", value: "14", icon: Zap },
    { label: "Model Type", value: "Random Forest", icon: Brain },
    { label: "Risk Levels", value: "3 Tiers", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-6 py-16 sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            ML-Powered Churn Prediction
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Predict customer churn before it happens
          </h1>
          <p className="mt-5 text-lg text-slate-400">
            ChurnSense AI uses a Random Forest model trained on 10,000 customer
            records to identify at-risk customers in real time. Enter customer
            details and get an instant churn probability, risk level, and
            recommendation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onAnalyze}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-transform hover:scale-[1.02]"
            >
              <Target className="h-4 w-4" />
              Analyze a Customer
            </button>
            <button
              onClick={onShowModel}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
            >
              <Brain className="h-4 w-4" />
              Explore the Model
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-slate-700"
            >
              <Icon className="mb-3 h-6 w-6 text-cyan-400" />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          );
        })}
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Enter customer data",
              desc: "Provide demographic, usage, and complaint details for the customer you want to evaluate.",
            },
            {
              icon: Brain,
              title: "Model evaluates risk",
              desc: "A Random Forest model analyzes 14 engineered features to produce a churn probability score.",
            },
            {
              icon: TrendingDown,
              title: "Get actionable insight",
              desc: "Receive a churn prediction, probability percentage, and a Low / Medium / High risk level.",
            },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── Model Intelligence ───────────────────────── */

function ModelIntelligence() {
  const features = [
    { name: "Age", category: "Demographic" },
    { name: "MonthlyCharges", category: "Billing" },
    { name: "AvgCallMinutes", category: "Usage" },
    { name: "AvgDataUsageGB", category: "Usage" },
    { name: "AvgSMSCount", category: "Usage" },
    { name: "TotalComplaints", category: "Complaints" },
    { name: "AvgComplaints", category: "Complaints" },
    { name: "MaxComplaints", category: "Complaints" },
    { name: "TenureMonths", category: "Tenure" },
    { name: "Gender_Male", category: "Demographic" },
    { name: "Region_Suburban", category: "Geographic" },
    { name: "Region_Urban", category: "Geographic" },
    { name: "ContractType_Prepaid", category: "Contract" },
    { name: "ContractType_Yearly", category: "Contract" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Model Intelligence</h1>
        <p className="mt-2 text-slate-400">
          A look under the hood at the machine learning model powering ChurnSense AI.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={Brain} title="Algorithm" value="Random Forest" desc="Ensemble of decision trees trained on customer data." />
        <InfoCard icon={Users} title="Training Data" value="10,000" desc="Customer records with churn labels." />
        <InfoCard icon={Zap} title="Input Features" value="14" desc="Engineered from usage, complaints, and demographics." />
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Feature set</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.name}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
            >
              <code className="text-sm font-medium text-cyan-300">{f.name}</code>
              <span className="text-xs text-slate-500">{f.category}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-3 text-xl font-bold">Preprocessing pipeline</h2>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> Missing Age values imputed using median imputation.</li>
          <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> SignupDate converted to datetime; TenureMonths derived.</li>
          <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> Categorical features one-hot encoded (Gender, Region, ContractType).</li>
          <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> Usage features aggregated: call minutes, data, SMS, and complaints.</li>
        </ul>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  value,
  desc,
}: {
  icon: typeof Brain;
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <Icon className="mb-3 h-6 w-6 text-cyan-400" />
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <p className="mt-2 text-sm text-slate-400">{desc}</p>
    </div>
  );
}

/* ───────────────────────── Insights ───────────────────────── */

function Insights() {
  const factors = [
    { label: "Total Complaints", impact: "High", desc: "More complaints strongly correlate with churn risk.", pct: 85 },
    { label: "Tenure (Months)", impact: "High", desc: "Newer customers show higher churn probability.", pct: 78 },
    { label: "Monthly Charges", impact: "Medium", desc: "Higher monthly bills increase likelihood of leaving.", pct: 62 },
    { label: "Contract Type", impact: "Medium", desc: "Monthly/prepaid contracts churn more than yearly.", pct: 55 },
    { label: "Average Call Minutes", impact: "Low", desc: "Lower engagement signals potential disengagement.", pct: 35 },
    { label: "Data Usage (GB)", impact: "Low", desc: "Declining data usage can precede cancellation.", pct: 30 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="mt-2 text-slate-400">
          Key factors that influence customer churn predictions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {factors.map((f) => (
          <div
            key={f.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{f.label}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  f.impact === "High"
                    ? "bg-red-500/10 text-red-400"
                    : f.impact === "Medium"
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {f.impact} impact
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600"
                style={{ width: `${f.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-3 text-xl font-bold">Recommendation framework</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <RecCard level="Low" color="emerald" desc="Monitor periodically. Maintain engagement with loyalty rewards." />
          <RecCard level="Medium" color="amber" desc="Proactive outreach recommended. Offer targeted incentives." />
          <RecCard level="High" color="red" desc="Immediate retention action needed. Personal account manager follow-up." />
        </div>
      </section>
    </div>
  );
}

function RecCard({
  level,
  color,
  desc,
}: {
  level: string;
  color: "emerald" | "amber" | "red";
  desc: string;
}) {
  const colorMap = {
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    amber: "text-amber-400 border-amber-500/30 bg-amber-500/5",
    red: "text-red-400 border-red-500/30 bg-red-500/5",
  };
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="mb-2 flex items-center gap-2">
        <ChartBar className="h-4 w-4" />
        <span className="font-semibold">{level} Risk</span>
      </div>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );
}

/* ───────────────────────── About ───────────────────────── */

function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">About ChurnSense AI</h1>
        <p className="mt-2 text-slate-400">
          Predictive intelligence for customer retention.
        </p>
      </div>

      <div className="space-y-4 text-slate-300">
        <p>
          ChurnSense AI is a machine learning application that predicts which
          customers are likely to cancel their service. It uses a Random Forest
          classification model trained on 10,000 customer records with 14
          engineered features covering demographics, usage patterns, complaint
          history, and contract details.
        </p>
        <p>
          The backend is powered by FastAPI and deployed on Render. The model
          and feature pipeline were built through a complete data science
          workflow: data preprocessing, missing-value imputation, feature
          engineering, one-hot encoding, and model training.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <Brain className="mb-3 h-6 w-6 text-cyan-400" />
          <h3 className="font-semibold">Model Backend</h3>
          <p className="mt-1 text-sm text-slate-400">
            FastAPI + scikit-learn Random Forest, deployed on Render with a
            RESTful prediction endpoint.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <Activity className="mb-3 h-6 w-6 text-cyan-400" />
          <h3 className="font-semibold">Real-time Prediction</h3>
          <p className="mt-1 text-sm text-slate-400">
            Submit customer details and receive an instant churn probability
            and risk classification.
          </p>
        </div>
      </section>
    </div>
  );
}
