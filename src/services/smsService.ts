import { Strings } from "../utils/Strings";

export interface SendSMSPayload {
  to: string;
  message: string;
}

export interface SendSMSResult {
  ok: boolean;
  status: number;
  data?: unknown;
  error?: string;
}

export async function sendSMS(payload: SendSMSPayload): Promise<SendSMSResult> {
  try {
    const res = await fetch(Strings.SMS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data: unknown = undefined;
    try {
      data = await res.json();
    } catch (_) {
      // ignore non-JSON
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data,
        error: typeof data === "object" && data && "error" in (data as any)
          ? String((data as any).error)
          : `Request failed with status ${res.status}`,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (err: any) {
    return { ok: false, status: 0, error: err?.message || "Network error" };
  }
}
