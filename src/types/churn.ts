export interface ChurnPredictionRequest {
  Age: number;
  MonthlyCharges: number;
  AvgCallMinutes: number;
  AvgDataUsageGB: number;
  AvgSMSCount: number;
  TotalComplaints: number;
  AvgComplaints: number;
  MaxComplaints: number;
  TenureMonths: number;
  Gender_Male: boolean;
  Region_Suburban: boolean;
  Region_Urban: boolean;
  ContractType_Prepaid: boolean;
  ContractType_Yearly: boolean;
}

export interface ChurnPredictionResponse {
  churn_prediction: number;
  churn_probability: number;
  risk_level: string;
}

export type RiskLevel = "Low" | "Medium" | "High";

export type Gender = "Female" | "Male" | "Other";
export type Region = "Rural" | "Suburban" | "Urban";
export type ContractType = "Monthly" | "Prepaid" | "Yearly";

export type SectionId = "overview" | "analyzer" | "model" | "insights" | "about";

export interface CustomerFormInput {
  age: number;
  monthlyCharges: number;
  avgCallMinutes: number;
  avgDataUsageGB: number;
  avgSMSCount: number;
  totalComplaints: number;
  maxComplaints: number;
  tenureMonths: number;
  gender: Gender;
  region: Region;
  contractType: ContractType;
}
