import { FormSchema } from '@/src/lib/transaction.utils';
import { hasProperty, isObject } from '@/src/lib/typeguard.utils';
import { Transaction } from '@prisma/client';
import { MatcherCreator, Matcher } from 'jest-mock-extended';

export const transactionMatcherFactory = (input: FormSchema) => {
  const { name, amount, date, category } = input;
  const expectedInput = {
    data: {
      name,
      amount,
      date,
      categoryId: category,
    },
  };
  const responseTransaction: Transaction = {
    transactionId: Math.floor(Math.random() * 1000), // Random integer
    name,
    amount,
    date,
    categoryId: category,
  };

  const transactionMatcher: MatcherCreator<unknown> = () =>
    new Matcher((actualValue) => {
      if (!isObject(actualValue) || !hasProperty(actualValue, 'data')) {
        return false;
      }

      const actualData = actualValue.data;
      if (!isObject(actualData)) {
        return false;
      }

      const expectedData = expectedInput.data;

      return (
        actualData.name === expectedData.name &&
        actualData.amount === expectedData.amount &&
        actualData.date === expectedData.date &&
        actualData.categoryId === expectedData.categoryId
      );
    }, '');
  return {
    matcher: transactionMatcher,
    response: responseTransaction,
  };
};
