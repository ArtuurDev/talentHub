import z from "zod/v3";

export const envSchema = z.object({
  NODE_ENV: z.string(),
  JWT_SECRET: z.string(),
  JWT_SECRET_ISSUER: z.string(),
  JWT_SECRECT_AUDIENCE: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string(),
})

export type Env = z.infer<typeof envSchema>