import { apiFetch } from "@/lib/api";

export type RadioSourceMode = "auto" | "zeno" | "presenter";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function isRadioSourceMode(value: unknown): value is RadioSourceMode {
  return value === "auto" || value === "zeno" || value === "presenter";
}

export async function getRadioSourceMode(): Promise<RadioSourceMode> {
  const response = await apiFetch(`${API_URL}/api/radio-source`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !isRadioSourceMode(data.mode)) {
    throw new Error(data.error || "Failed to load radio source mode.");
  }
  return data.mode;
}

export async function updateRadioSourceMode(mode: RadioSourceMode): Promise<RadioSourceMode> {
  const response = await apiFetch(`${API_URL}/api/radio-source`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ mode }),
  });
  const data = await response.json();
  if (!response.ok || !isRadioSourceMode(data.mode)) {
    throw new Error(data.error || "Failed to update radio source mode.");
  }
  return data.mode;
}
