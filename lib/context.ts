import { PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export const context: Context = {
  prisma: prisma as unknown as PrismaClient,
};

export type Context = {
  prisma: PrismaClient;
};

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  const mockedPrisma = mockDeep<PrismaClient>();
  return {
    prisma: mockedPrisma,
  };
};
