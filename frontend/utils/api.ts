const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function signupUser(userId: string, name: string, email: string) {
  const res = await fetch(
    `${BASE_URL}/users/signup?user_id=${encodeURIComponent(userId)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`,
    { method: "POST" }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Signup failed");
  }
  return res.json();
}

export async function submitFinancialData(userId: string, data: object) {
  const res = await fetch(
    `${BASE_URL}/finances/health?user_id=${encodeURIComponent(userId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Submission failed");
  }
  return res.json();
}

export async function predictSavings(userId: string, monthlySavings: number[]) {
  const res = await fetch(
    `${BASE_URL}/finances/predict-savings?user_id=${encodeURIComponent(userId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthly_savings: monthlySavings }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Prediction failed");
  }
  return res.json();
}

export async function getUserProfile(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

export async function getFinancialHistory(userId: string) {
  const res = await fetch(`${BASE_URL}/finances/history/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("No history found");
  return res.json();
}