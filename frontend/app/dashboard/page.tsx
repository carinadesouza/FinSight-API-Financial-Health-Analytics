"use client"
import { useState } from "react";
import { submitFinancialData } from "../../utils/api";

export default function Dashboard() {
  const [userId, setUserId] = useState("");
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<{ [key: string]: number }>({
    rent: 0,
    food: 0,
    utilities: 0,
  });
  const [debts, setDebts] = useState<number>(0);
  const [savings, setSavings] = useState<number>(0);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const data = {
      income,
      expenses,
      debts,
      savings,
      investments: {},
    };
    const res = await submitFinancialData(userId, data);
    setMessage(JSON.stringify(res, null, 2));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Financial Dashboard</h1>

      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Monthly Income"
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Rent Expense"
          value={expenses.rent}
          onChange={(e) =>
            setExpenses({ ...expenses, rent: Number(e.target.value) })
          }
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Food Expense"
          value={expenses.food}
          onChange={(e) =>
            setExpenses({ ...expenses, food: Number(e.target.value) })
          }
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Utilities Expense"
          value={expenses.utilities}
          onChange={(e) =>
            setExpenses({ ...expenses, utilities: Number(e.target.value) })
          }
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Debts"
          value={debts}
          onChange={(e) => setDebts(Number(e.target.value))}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Savings"
          value={savings}
          onChange={(e) => setSavings(Number(e.target.value))}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Submit
        </button>
        {message && <pre className="mt-4 text-gray-700">{message}</pre>}
      </div>
    </div>
  );
}
