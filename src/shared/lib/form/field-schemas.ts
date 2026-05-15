import { z } from "zod";

export const fieldSchemas = {
  string: (label: string, min = 1) =>
    z
      .string()
      .trim()
      .min(min, `${label} is required`),

  email: () =>
    z
      .string()
      .trim()
      .email("Enter a valid email address"),

  password: () =>
    z
      .string()
      .min(8, "Password must be at least 8 characters"),

  number: (label: string, min?: number, max?: number) => {
    let schema = z.coerce.number({
      error: `${label} must be a number`,
    });
    if (min !== undefined) schema = schema.min(min, `${label} must be at least ${min}`);
    if (max !== undefined) schema = schema.max(max, `${label} must be at most ${max}`);
    return schema;
  },

  date: (label: string) =>
    z.coerce.date({
      error: `${label} must be a valid date`,
    }),

  select: (label: string) =>
    z
      .string()
      .trim()
      .min(1, `${label} is required`),
};
