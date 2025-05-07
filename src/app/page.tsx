import prisma from '@/lib/prisma';
import { TransactionForm } from '@/src/components/transaction/transaction-form';
import TransactionList from '../components/transaction/transaction-list';

export default async function Home() {
  const transactions = await prisma.transaction.findMany();
  return (
    <div className="flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="h-[calc(100vh_-_37px)] w-full md:w-1/2 p-8 bg-white shadow-md">
        <TransactionForm />
      </div>

      {/* Right: List */}
      <TransactionList transactions={transactions} />
    </div>
  );
}
