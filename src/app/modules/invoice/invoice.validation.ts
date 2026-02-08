import { z } from 'zod';

const invoiceItemSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.string().min(1),
  price: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

const payableToSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const paymentDetailsSchema = z
  .object({
    bkash: z
      .object({
        number: z.string().optional(),
        type: z.enum(['Personal', 'Agent', 'Merchant']).optional(),
      })
      .optional(),
    bank: z
      .object({
        bankName: z.string().optional(),
        accountName: z.string().optional(),
        accountNumber: z.string().optional(),
      })
      .optional(),
  })
  .optional();

export const updateInvoiceZodSchema = z.object({
  body: z
    .object({
      // allow partial update
      payableTo: payableToSchema.optional(),
      items: z.array(invoiceItemSchema).min(1).optional(),

      discount: z.number().nonnegative().optional(),
      tax: z.number().nonnegative().optional(),
      note: z.string().optional(),

      paymentInfo: z.boolean().optional(),
      paymentMethod: z.enum(['Bank', 'Bkash', 'Cash']).optional(),
      paymentDetails: paymentDetailsSchema,

      status: z.enum(['PAID', 'UNPAID', 'PENDING']).optional(),
    })
    .strict(),
});
