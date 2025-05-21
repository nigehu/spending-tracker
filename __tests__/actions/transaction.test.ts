import { createTransaction } from '@/src/app/actions';
import { FormSchema } from '@/src/lib/transaction.utils';
import { MockContext, createMockContext } from '@/lib/context';
import { expect, test, beforeEach, mock } from 'bun:test';
import { transactionMatcherFactory } from '@/lib/matchers';
import { any } from 'jest-mock-extended';

let mockCtx: MockContext;

mock.module('next/cache', () => {
  return {
    revalidatePath: () => null,
  };
});

beforeEach(() => {
  mockCtx = createMockContext();
});

test('it should accept the default parameters', async () => {
  const date = new Date();
  const inputTransaction: FormSchema = {
    name: 'Test Transaction',
    amount: 100,
    date,
    category: 1,
  };
  const { matcher, response } = transactionMatcherFactory(inputTransaction);
  mockCtx.prisma.transaction.create.calledWith(matcher()).mockResolvedValue(response);
  mockCtx.prisma.category.findUnique.calledWith(any()).mockResolvedValue({ categoryId: 1 });

  await expect(createTransaction(inputTransaction, mockCtx)).resolves.toEqual(response);
});

test('should throw an error if input form does not have the correct properties', async () => {
  const badTransaction = {};
  await expect(createTransaction(badTransaction, mockCtx)).rejects.toThrow(
    'Transaction requires the following fields: name, amount, date, category',
  );
});

test('should throw an error if name is not a string', async () => {
  const badTransaction = {
    name: 100,
    amount: 100,
    date: new Date(),
    category: 1,
  };
  await expect(createTransaction(badTransaction, mockCtx)).rejects.toThrow(
    'Transaction name must be a string',
  );
});

test('should throw an error if name is not a string', async () => {
  const badTransaction = {
    name: 'Test Transaction',
    amount: '100',
    date: new Date(),
    category: 1,
  };
  await expect(createTransaction(badTransaction, mockCtx)).rejects.toThrow(
    'Transaction amount must be a number',
  );
});

test('should throw an error if name is not a string', async () => {
  const badTransaction = {
    name: 'Test Transaction',
    amount: 100,
    date: '2020-01-01',
    category: 1,
  };
  await expect(createTransaction(badTransaction, mockCtx)).rejects.toThrow(
    'Transaction date must be a date',
  );
});

test('should throw an error if name is not a string', async () => {
  const badTransaction = {
    name: 'Test Transaction',
    amount: 100,
    date: new Date(),
    category: '1',
  };
  await expect(createTransaction(badTransaction, mockCtx)).rejects.toThrow(
    'Transaction category must be a number',
  );
});

test('should throw an error if name is not a string', async () => {
  const badTransaction = {
    name: 'Test Transaction',
    amount: 100,
    date: new Date(),
    category: '1',
  };
  await expect(createTransaction(badTransaction, mockCtx)).rejects.toThrow(
    'Transaction category must be a number',
  );
});

test('should throw an error if name is not a string', async () => {
  const badTransaction = {
    name: 'Test Transaction',
    amount: 100,
    date: new Date(),
    category: 1,
  };
  mockCtx.prisma.category.findUnique.calledWith(any()).mockResolvedValue(undefined);
  await expect(createTransaction(badTransaction, mockCtx)).rejects.toThrow(
    'Transaction category must exist',
  );
});
