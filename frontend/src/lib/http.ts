/** A readable message from a backend error body ({ message: string | string[] }) */
export function errorMessage(data: unknown, fallback = "Something went wrong") {
  const m = (data as { message?: unknown } | null)?.message;
  const first = Array.isArray(m) ? m[0] : m;
  // Validation messages look like "customer.phone: Please enter…" — keep only the sentence
  return typeof first === "string" && first ? first.replace(/^[\w.]+:\s*/, "") : fallback;
}
