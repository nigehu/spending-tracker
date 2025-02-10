import prisma from '@/lib/prisma'

export default async function Test() {
  const transactions = await prisma.transaction.findMany();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
        Transactions
      </h1>
      <ol className="list-decimal list-inside font-[family-name:var(--font-geist-sans)]">
        {transactions.map((transaction) => (
          <li key={transaction.transactionId} className="mb-2">
            {transaction.name} ({transaction.amount})
          </li>
        ))}
      </ol>
    </div>
  );
}
