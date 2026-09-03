import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Info,
  Lock,
  Radar,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Target,
} from "lucide-react";
import {
  predictChurn,
  PredictionError,
} from "@/services/predictionService";
import type {
  ChurnPredictionResponse,
  ContractType,
  CustomerFormInput,
  Gender,
  Region,
} from "@/types/churn";
import ProcessingScreen from "@/components/ProcessingScreen";
import ResultReport from "@/components/ResultReport";

type Phase = "form" | "processing" | "result" | "error";

type FieldKey =
  | "age"
  | "monthlyCharges"
  | "avgCallMinutes"
  | "avgDataUsageGB"
  | "avgSMSCount"
  | "totalComplaints"
  | "maxComplaints"
  | "tenureMonths";

interface FormState {
  age: string;
  monthlyCharges: string;
  avgCallMinutes: string;
  avgDataUsageGB: string;
  avgSMSCount: string;
  totalComplaints: string;
  maxComplaints: string;
  tenureMonths: string;
  gender: string;
  region: string;
  contractType: string;
}

const DEFAULT_FORM: FormState = {
  age: "",
  monthlyCharges: "",
  avgCallMinutes: "",
  avgDataUsageGB: "",
  avgSMSCount: "",
  totalComplaints: "",
  maxComplaints: "",
  tenureMonths: "",
  gender: "",
  region: "",
  contractType: "",
};

const NUMERIC_FIELDS: {
  key: FieldKey;
  label: string;
  placeholder: string;
  step: string;
  help?: string;
}[] = [
  { key: "age", label: "Age", placeholder: "Enter customer age...", step: "1", help: "The customer's age in years." },
  { key: "monthlyCharges", label: "Monthly Charges ($)", placeholder: "Enter monthly charges...", step: "0.01", help: "How much the customer pays per month." },
  { key: "avgCallMinutes", label: "Avg. Call Minutes / Month", placeholder: "Enter average call minutes...", step: "1", help: "Average monthly call minutes over the 12-month usage period." },
  { key: "avgDataUsageGB", label: "Avg. Data Usage (GB) / Month", placeholder: "Enter data usage in GB...", step: "0.1", help: "Average monthly mobile data usage in gigabytes." },
  { key: "avgSMSCount", label: "Avg. SMS Count / Month", placeholder: "Enter average SMS count...", step: "1", help: "Average number of text messages sent per month." },
  { key: "totalComplaints", label: "Total Complaints", placeholder: "Enter total complaints...", step: "1", help: "Total complaints the customer filed across the 12-month usage period." },
  { key: "maxComplaints", label: "Max Complaints (Single Month)", placeholder: "Enter maximum complaints...", step: "1", help: "The most complaints the customer filed in any single month." },
  { key: "tenureMonths", label: "Tenure (Months)", placeholder: "Enter tenure in months...", step: "1", help: "How many months the customer has been with the service." },
];

export default function RiskAnalyzer() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [phase, setPhase] = useState<Phase>("form");
  const [processingComplete, setProcessingComplete] = useState(false);
  const [result, setResult] = useState<ChurnPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<CustomerFormInput | null>(null);

  // Auto-calculate AvgComplaints = TotalComplaints / 12
  const avgComplaints = useMemo(() => {
    const total = parseFloat(form.totalComplaints);
    if (!isNaN(total) && total > 0) {
      return Number((total / 12).toFixed(2));
    }
    return 0;
  }, [form.totalComplaints]);

  const totalComplaintsEntered = form.totalComplaints !== "" && !isNaN(parseFloat(form.totalComplaints));

  function updateField(key: FieldKey, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): string | null {
    const num = (k: FieldKey) => parseFloat(form[k]);
    const checks: [FieldKey, string, number][] = [
      ["age", "Age", 1],
      ["monthlyCharges", "Monthly charges", 0],
      ["avgCallMinutes", "Avg. call minutes", 0],
      ["avgDataUsageGB", "Avg. data usage", 0],
      ["avgSMSCount", "Avg. SMS count", 0],
      ["totalComplaints", "Total complaints", 0],
      ["maxComplaints", "Max complaints", 0],
      ["tenureMonths", "Tenure", 1],
    ];
    for (const [k, label, min] of checks) {
      const v = num(k);
      if (isNaN(v)) return `${label} is required.`;
      if (v < min) return `${label} must be ${min === 0 ? "non-negative" : "at least " + min}.`;
    }
    if (!form.gender) return "Gender is required.";
    if (!form.region) return "Region is required.";
    if (!form.contractType) return "Contract type is required.";
    if (parseInt(form.maxComplaints) > parseInt(form.totalComplaints)) {
      return "Max complaints in a single month cannot exceed total complaints.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setPhase("error");
      return;
    }

    const data: CustomerFormInput = {
      age: parseInt(form.age),
      monthlyCharges: parseFloat(form.monthlyCharges),
      avgCallMinutes: parseFloat(form.avgCallMinutes),
      avgDataUsageGB: parseFloat(form.avgDataUsageGB),
      avgSMSCount: parseFloat(form.avgSMSCount),
      totalComplaints: parseInt(form.totalComplaints),
      maxComplaints: parseInt(form.maxComplaints),
      tenureMonths: parseInt(form.tenureMonths),
      gender: form.gender as Gender,
      region: form.region as Region,
      contractType: form.contractType as ContractType,
    };

    setSubmittedData(data);
    setError(null);
    setResult(null);
    setProcessingComplete(false);
    setPhase("processing");

    try {
      const response = await predictChurn(data);
      setResult(response);
      setProcessingComplete(true);
    } catch (err) {
      if (err instanceof PredictionError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      // Small delay so the processing screen shows briefly before error
      setTimeout(() => setPhase("error"), 800);
    }
  }

  function handleProcessingComplete() {
    setPhase("result");
  }

  function handleAnalyzeAnother() {
    setPhase("form");
    setResult(null);
    setError(null);
    setProcessingComplete(false);
    setSubmittedData(null);
  }

  function handleRetry() {
    if (submittedData) {
      setError(null);
      setResult(null);
      setProcessingComplete(false);
      setPhase("processing");
      predictChurn(submittedData)
        .then((response) => {
          setResult(response);
          setProcessingComplete(true);
        })
        .catch((err) => {
          if (err instanceof PredictionError) {
            setError(err.message);
          } else {
            setError("An unexpected error occurred. Please try again.");
          }
          setTimeout(() => setPhase("error"), 800);
        });
    } else {
      setPhase("form");
    }
  }

  function handleReset() {
    setForm(DEFAULT_FORM);
    setResult(null);
    setError(null);
    setPhase("form");
    setProcessingComplete(false);
    setSubmittedData(null);
  }

  // ─── Render by phase ───

  if (phase === "processing" && submittedData) {
    return (
      <div className="space-y-6">
        <SectionHeader />
        <ProcessingScreen
          customerData={submittedData}
          complete={processingComplete}
          onComplete={handleProcessingComplete}
        />
      </div>
    );
  }

  if (phase === "result" && result && submittedData) {
    return (
      <div className="space-y-6">
        <SectionHeader />
        <ResultReport
          result={result}
          customerData={submittedData}
          onAnalyzeAnother={handleAnalyzeAnother}
        />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="space-y-6">
        <SectionHeader />
        <ErrorScreen
          error={error}
          onRetry={handleRetry}
          onBackToForm={() => setPhase("form")}
        />
      </div>
    );
  }

  // Form phase
  return (
    <div className="space-y-6">
      <SectionHeader />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8"
      >
        {/* Demographics */}
        <FieldGroup title="Customer Demographics">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumericInput
              field={NUMERIC_FIELDS[0]}
              value={form.age}
              onChange={(v) => updateField("age", v)}
            />
            <SelectInput
              label="Gender"
              value={form.gender}
              placeholder="Select gender..."
              onChange={(v) => setForm((f) => ({ ...f, gender: v as Gender }))}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />
            <SelectInput
              label="Region"
              value={form.region}
              placeholder="Select region..."
              onChange={(v) => setForm((f) => ({ ...f, region: v as Region }))}
              options={[
                { value: "Urban", label: "Urban" },
                { value: "Suburban", label: "Suburban" },
                { value: "Rural", label: "Rural" },
              ]}
            />
            <SelectInput
              label="Contract Type"
              value={form.contractType}
              placeholder="Select contract type..."
              onChange={(v) => setForm((f) => ({ ...f, contractType: v as ContractType }))}
              options={[
                { value: "Monthly", label: "Monthly" },
                { value: "Prepaid", label: "Prepaid" },
                { value: "Yearly", label: "Yearly" },
              ]}
            />
          </div>
        </FieldGroup>

        {/* Billing & Tenure */}
        <FieldGroup title="Billing & Tenure">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumericInput
              field={NUMERIC_FIELDS[1]}
              value={form.monthlyCharges}
              onChange={(v) => updateField("monthlyCharges", v)}
            />
            <NumericInput
              field={NUMERIC_FIELDS[7]}
              value={form.tenureMonths}
              onChange={(v) => updateField("tenureMonths", v)}
            />
          </div>
        </FieldGroup>

        {/* Usage */}
        <FieldGroup title="Usage Patterns">
          <div className="grid gap-4 sm:grid-cols-3">
            <NumericInput
              field={NUMERIC_FIELDS[2]}
              value={form.avgCallMinutes}
              onChange={(v) => updateField("avgCallMinutes", v)}
            />
            <NumericInput
              field={NUMERIC_FIELDS[3]}
              value={form.avgDataUsageGB}
              onChange={(v) => updateField("avgDataUsageGB", v)}
            />
            <NumericInput
              field={NUMERIC_FIELDS[4]}
              value={form.avgSMSCount}
              onChange={(v) => updateField("avgSMSCount", v)}
            />
          </div>
        </FieldGroup>

        {/* Complaints */}
        <FieldGroup title="Complaint History">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumericInput
              field={NUMERIC_FIELDS[5]}
              value={form.totalComplaints}
              onChange={(v) => updateField("totalComplaints", v)}
            />
            <NumericInput
              field={NUMERIC_FIELDS[6]}
              value={form.maxComplaints}
              onChange={(v) => updateField("maxComplaints", v)}
            />
          </div>

          {/* Auto-calculated AvgComplaints */}
          <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-cyan-300">
                    Average Complaints
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                    <Lock className="h-2.5 w-2.5" />
                    Auto-calculated
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Average complaints = total complaints across the 12-month
                  usage period.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5">
                {totalComplaintsEntered ? (
                  <span className="text-2xl font-bold text-cyan-300 tabular-nums">
                    {avgComplaints.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-slate-600">
                    Calculated automatically
                  </span>
                )}
              </div>
            </div>
          </div>
        </FieldGroup>

        {/* Info banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <p className="text-xs text-slate-500">
            Enter real customer data for an accurate churn assessment. Fill in
            each field with the customer's actual information before analyzing.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-transform hover:scale-[1.02]"
          >
            <Radar className="h-4 w-4" />
            Analyze Customer Risk
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

/* ───────────────────────── Section Header ───────────────────────── */

function SectionHeader() {
  return (
    <div>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
        <Radar className="h-3.5 w-3.5" />
        Risk Intelligence Command Center
      </div>
      <h1 className="text-3xl font-bold">Analyze Customer Churn Risk</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Enter customer details to initiate a real-time churn prediction scan.
        Data is sent to the live Random Forest model for analysis.
      </p>
    </div>
  );
}

/* ───────────────────────── Error Screen ───────────────────────── */

function ErrorScreen({
  error,
  onRetry,
  onBackToForm,
}: {
  error: string | null;
  onRetry: () => void;
  onBackToForm: () => void;
}) {
  return (
    <div className="animate-fade-in flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-gradient-to-b from-slate-950 to-red-950/10 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
        <ShieldAlert className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="mt-6 text-xl font-bold tracking-wide text-red-300">
        ANALYSIS INTERRUPTED
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        {error || "Unable to reach prediction service."}
      </p>
      <div className="mt-4 rounded-lg border border-red-500/20 bg-slate-950/60 px-4 py-2">
        <span className="text-[10px] uppercase tracking-widest text-slate-500">
          Status:
        </span>{" "}
        <span className="font-mono text-xs font-semibold text-red-400">
          API CONNECTION FAILED
        </span>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-transform hover:scale-[1.02]"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Analysis
        </button>
        <button
          onClick={onBackToForm}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
        >
          <Target className="h-4 w-4" />
          Back to Form
        </button>
      </div>
      <p className="mt-4 text-xs text-slate-600">
        Your entered customer data has been preserved.
      </p>
    </div>
  );
}

/* ───────────────────────── Form helpers ───────────────────────── */

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

interface NumericFieldDef {
  key: FieldKey;
  label: string;
  placeholder: string;
  step: string;
  help?: string;
}

function NumericInput({
  field,
  value,
  onChange,
}: {
  field: NumericFieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        {field.label}
      </label>
      <input
        type="number"
        step={field.step}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
      {field.help && (
        <p className="mt-1 text-xs text-slate-500">{field.help}</p>
      )}
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border bg-slate-950/50 px-3.5 py-2.5 text-sm transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
          value === "" ? "border-slate-700 text-slate-600" : "border-slate-700 text-slate-100"
        }`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
