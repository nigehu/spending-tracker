import prisma from '@/lib/prisma';
import { TransactionForm } from '@/src/components/transaction-form';

export default async function Test() {
  const transactions = await prisma.transaction.findMany();
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="w-full md:w-1/2 p-8 bg-white shadow-md">
        <TransactionForm />
      </div>

      {/* Right: List */}
      <div className="w-full md:w-1/2 p-8 bg-gray-100">
        <h2 className="text-2xl font-semibold mb-6">Entries</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No entries yet.</p>
        ) : (
          <ul className="space-y-4">
            {transactions.map((entry, idx) => (
              <li key={idx} className="bg-white p-4 rounded shadow">
                <p className="font-medium">{entry.name}</p>
                <p className="text-gray-600 text-sm">{entry.amount}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
