import prisma from '@/lib/prisma';
import TransactionList from '../../components/transaction/transaction-list';

export default async function Home() {
  const transactions = (await prisma.transaction.findMany()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const categories = await prisma.category.findMany();
  return (
    <div className="flex flex-col md:flex-row">
      <TransactionList transactions={transactions} categories={categories} />
    </div>
  );
}
