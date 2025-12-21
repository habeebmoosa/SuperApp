import { z } from "zod";

export const UserRegisterSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

export const UserLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
