-- DropForeignKey
ALTER TABLE "BudgetCategory" DROP CONSTRAINT "BudgetCategory_budgetId_fkey";

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("budgetId") ON DELETE CASCADE ON UPDATE CASCADE;
