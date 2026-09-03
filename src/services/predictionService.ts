import type {
  ChurnPredictionRequest,
  ChurnPredictionResponse,
  CustomerFormInput,
} from "@/types/churn";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://customer-churn-api-x135.onrender.com";

export function buildPredictionPayload(
  input: CustomerFormInput
): ChurnPredictionRequest {
  return {
    Age: input.age,
    MonthlyCharges: input.monthlyCharges,
    AvgCallMinutes: input.avgCallMinutes,
    AvgDataUsageGB: input.avgDataUsageGB,
    AvgSMSCount: input.avgSMSCount,
    TotalComplaints: input.totalComplaints,
    AvgComplaints: input.totalComplaints > 0
      ? Number((input.totalComplaints / 12).toFixed(2))
      : 0,
    MaxComplaints: input.maxComplaints,
    TenureMonths: input.tenureMonths,
    Gender_Male: input.gender === "Male",
    Region_Suburban: input.region === "Suburban",
    Region_Urban: input.region === "Urban",
    ContractType_Prepaid: input.contractType === "Prepaid",
    ContractType_Yearly: input.contractType === "Yearly",
  };
}

export class PredictionError extends Error {
  constructor(
    message: string,
    public kind: "network" | "api" | "validation" = "api"
  ) {
    super(message);
    this.name = "PredictionError";
  }
}

export async function predictChurn(
  input: CustomerFormInput
): Promise<ChurnPredictionResponse> {
  const payload = buildPredictionPayload(input);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new PredictionError(
      "Unable to reach the prediction server. Please check your connection and try again.",
      "network"
    );
  }

  if (response.status === 422) {
    const detail = await response.json().catch(() => null);
    const message =
      detail?.detail?.[0]?.msg ||
      detail?.detail ||
      "The server rejected the request due to invalid input values.";
    throw new PredictionError(
      typeof message === "string" ? message : "Validation error in submitted data.",
      "validation"
    );
  }

  if (!response.ok) {
    throw new PredictionError(
      `The prediction service returned an error (HTTP ${response.status}). Please try again.`,
      "api"
    );
  }

  const data: ChurnPredictionResponse = await response.json();
  return data;
}
