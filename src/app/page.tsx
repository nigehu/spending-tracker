import { redirect } from 'next/navigation';
import dayjs from 'dayjs';

export default function BudgetsPage() {
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1; // Convert to 1-based month

  redirect(`/${currentYear}/${currentMonth}`);
  return null;
}
