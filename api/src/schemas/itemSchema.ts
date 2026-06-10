import { z } from 'zod';

export const itemSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  price: z.preprocess((val) => Number(val), z.number().positive('El precio debe ser un número positivo')),
  offerType: z.enum(['Descuento en dinero', 'Descuento en porcentaje'], {
    errorMap: () => ({ message: 'Tipo de oferta inválido' }),
  }),
  discountValue: z.preprocess((val) => Number(val), z.number().nonnegative('El valor de descuento no puede ser negativo')),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
}).superRefine((data, ctx) => {
  if (data.offerType === 'Descuento en porcentaje' && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El porcentaje de descuento no puede ser mayor a 100%',
      path: ['discountValue'],
    });
  }
  if (data.offerType === 'Descuento en dinero' && data.discountValue > data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El descuento en dinero no puede ser mayor al precio original',
      path: ['discountValue'],
    });
  }

  const startValid = !isNaN(data.startDate.getTime());
  const endValid = !isNaN(data.endDate.getTime());

  if (!startValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Fecha de inicio inválida',
      path: ['startDate'],
    });
  }
  if (!endValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Fecha de fin inválida',
      path: ['endDate'],
    });
  }

  if (startValid && endValid) {
    const start = new Date(data.startDate.getFullYear(), data.startDate.getMonth(), data.startDate.getDate());
    const end = new Date(data.endDate.getFullYear(), data.endDate.getMonth(), data.endDate.getDate());

    if (start > end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
        path: ['endDate'],
      });
    }
  }
});
export type ParsedItem = z.infer<typeof itemSchema>;
