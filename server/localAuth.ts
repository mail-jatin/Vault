import { hash, compare } from "bcrypt";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string(),
});

export async function registerLocalUser(data: z.infer<typeof registerSchema>) {
  const validated = registerSchema.parse(data);
  
  const existingUser = await storage.getUserByEmail(validated.email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hash(validated.password, 10);
  
  const user = await storage.upsertUser({
    id: `local_${Date.now()}`,
    email: validated.email,
    firstName: validated.firstName,
    lastName: validated.lastName,
    hashedPassword,
    authProvider: "local",
  });

  return user;
}

export async function loginLocalUser(email: string, password: string) {
  const user = await storage.getUserByEmail(email);
  
  if (!user || user.authProvider !== "local") {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = await compare(password, user.hashedPassword || "");
  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  return user;
}
