"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormProps,
} from "react-hook-form";

type UseZodFormOptions<TFieldValues extends FieldValues> = Omit<
  UseFormProps<TFieldValues>,
  "resolver" | "defaultValues"
> & {
  schema: unknown;
  defaultValues?: DefaultValues<TFieldValues>;
};

export const useZodForm = <TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  ...rest
}: UseZodFormOptions<TFieldValues>) => {
  return useForm<TFieldValues>({
    resolver: zodResolver(schema as never) as UseFormProps<TFieldValues>["resolver"],
    defaultValues,
    mode: "onBlur",
    ...rest,
  });
};
