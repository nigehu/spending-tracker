import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  transactionType: z.enum(['DEBIT', 'CREDIT']),
});

export type FormSchema = z.infer<typeof formSchema>;
