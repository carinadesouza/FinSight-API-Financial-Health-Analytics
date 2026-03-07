"use client";

import { useState } from "react";
import { signupUser } from "../utils/api";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

const handleSignup = async () => {
  try {
    const res = await signupUser(userId, name, email);

    setMessage("Signup successful!");
const handleSignup = async () => {
    try {
      const res = await signupUser(userId, name, email);

      setMessage("Signup successful!");

      // redirect to dashboard
      router.push(`/dashboard?userId=${userId}`);

    } catch (err) {
      setMessage("Error creating user");
      console.error(err);
    }
  };
    // redirect to dashboard
    router.push(`/dashboard?userId=${userId}`);
  } catch (err) {
    setMessage("Error creating user");
    console.error(err);
  }
};
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6">FinSight Dashboard</h1>

      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Signup</h2>

        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Signup
        </button>

        {message && <p className="mt-4 text-green-600">{message}</p>}
      </div>
    </div>
  );
}
