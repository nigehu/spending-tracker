import { createTransaction } from '@/src/app/actions';
import { FormSchema } from '@/src/lib/transaction.utils';
import { MockContext, Context, createMockContext } from '@/lib/context';
import { expect, test, beforeEach, mock } from 'bun:test';
import { transactionMatcherFactory } from '@/lib/matchers';

let mockCtx: MockContext;
let ctx: Context;

mock.module('next/cache', () => {
  return {
    revalidatePath: () => null,
  };
});

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

test('createTodo', async () => {
  const date = new Date();
  const inputTransaction: FormSchema = {
    name: 'Test Transaction',
    amount: 100,
    date,
    category: 1,
  };
  const { matcher, response } = transactionMatcherFactory(inputTransaction);
  mockCtx.prisma.transaction.create.calledWith(matcher()).mockResolvedValue(response);

  await expect(createTransaction(inputTransaction, mockCtx)).resolves.toEqual(response);
});

test('should throw an error if title is missing', async () => {
  const badTransaction = {} as FormSchema;
  await expect(createTransaction(badTransaction, ctx)).rejects.toThrow('Title is required');
});
