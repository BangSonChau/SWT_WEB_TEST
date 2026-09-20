import { z } from "zod";

export const loginShemaZob = z
  .object({
    email: z
      .string({ message: "Email ko đc để trống" })
      .min(3, { message: "Email cần ít nhất 3 kí tự" })
      .email({ message: "Email ko đúng định dạng" }),

    password: z
      .string({ message: "Password không được để trống" })
      .min(6, { message: "Password cần ít nhất 6 kí tự" })
  });

export type loginSchemaZobType = z.infer<typeof loginShemaZob>