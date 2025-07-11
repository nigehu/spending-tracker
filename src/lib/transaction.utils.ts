import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  date: z.date({
    required_error: 'Please select a date',
  }),
  amount: z.coerce
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .optional(),
  category: z.coerce.number(),
});

export type FormSchema = z.infer<typeof formSchema>;
