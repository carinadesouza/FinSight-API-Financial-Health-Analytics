export const API_BASE = "http://127.0.0.1:8000";

export async function signupUser(userId: string, name: string, email: string) {
  const res = await fetch(
    `${API_BASE}/users/signup?user_id=${encodeURIComponent(userId)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`,
    { method: "POST" }
  );

  return res.json();
}

export async function getUser(userId: string) {
  const res = await fetch(`${API_BASE}/users/${userId}`);
  return handleResponse(res);
}

export async function submitFinancialData(userId: string, data: any) {
  const res = await fetch(`${API_BASE}/finances/health?user_id=${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function predictSavings(userId: string, monthlySavings: number[]) {
  const res = await fetch(`${API_BASE}/finances/predict-savings?user_id=${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(monthlySavings),
  });
  return res.json();
}
async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API Error");
  }
  return res.json();
}