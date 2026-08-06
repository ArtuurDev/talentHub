import z from "zod/v3";

export const envSchema = z.object({
  NODE_ENV: z.string(),
  JWT_SECRET: z.string(),
  JWT_SECRET_ISSUER: z.string(),
  JWT_SECRECT_AUDIENCE: z.string()
})

export type Env = z.infer<typeof envSchema>