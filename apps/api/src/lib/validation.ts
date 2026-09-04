import { resolveDistrictName } from "./geo.ts";

export const FINANCIAL_LEVELS = ["low", "medium", "high"] as const;
export type FinancialLevel = (typeof FINANCIAL_LEVELS)[number];

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Maps Flask income numbers and free-text labels to low | medium | high.
 * Flask currently sends financialLevel as a yearly income string (e.g. "150000").
 */
export function normalizeFinancialLevel(value: unknown): FinancialLevel | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return bandFromIncome(value);
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const numeric = Number(raw.replace(/,/g, ""));
  if (Number.isFinite(numeric) && /^-?\d+(\.\d+)?$/.test(raw.replace(/,/g, ""))) {
    return bandFromIncome(numeric);
  }

  const lower = raw.toLowerCase();
  if (lower.includes("low") || lower.includes("bpl") || lower.includes("ews") || lower.includes("farm labour")) {
    return "low";
  }
  if (lower.includes("high") || lower.includes("affluent")) {
    return "high";
  }
  if (lower.includes("medium") || lower.includes("mid") || lower.includes("moderate")) {
    return "medium";
  }

  throw new ValidationError(
    "financialLevel must be low, medium, high, or an annual family income number."
  );
}

function bandFromIncome(income: number): FinancialLevel {
  if (income < 0) {
    throw new ValidationError("financialLevel income cannot be negative.");
  }
  if (income <= 300000) return "low";
  if (income <= 800000) return "medium";
  return "high";
}

export function parsePercentage(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(n)) {
    throw new ValidationError("percentage must be a number between 0 and 100.");
  }
  if (n < 0 || n > 100) {
    throw new ValidationError("percentage must be between 0 and 100.");
  }
  return n;
}

export function parseEducationLevel(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError("educationLevel is required.");
  }
  const level = value.trim();
  if (level.length > 80) {
    throw new ValidationError("educationLevel is too long.");
  }
  return level;
}

export function parseDistrict(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError("district is required.");
  }
  const resolved = resolveDistrictName(value);
  if (!resolved) {
    throw new ValidationError(
      `district '${value}' is not a supported Maharashtra district.`
    );
  }
  return resolved;
}

export function parseWillingToMove(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number" && (value === 0 || value === 1)) {
    return value === 1;
  }
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0") return false;
  }
  throw new ValidationError("willingToMove must be a boolean.");
}

export function parseStudentName(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new ValidationError("name must be a string.");
  }
  return value.trim().slice(0, 80) || null;
}
