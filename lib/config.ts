import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.union([
    z.literal('production'),
    z.literal('development'),
    z.string(),
  ]),

  CF_TEAM_DOMAIN: z.string(),
  CF_APP_AUDIENCE: z.string(),
  CF_JWT: z.string().optional(),
  SERVICES_JSON_PATH: z.string(),
})

export const env = schema.parse({
  NODE_ENV: process.env.NODE_ENV,

  CF_TEAM_DOMAIN: process.env.CF_TEAM_DOMAIN,
  CF_APP_AUDIENCE: process.env.CF_APP_AUDIENCE,
  CF_JWT: process.env.CF_JWT,
  SERVICES_JSON_PATH: process.env.SERVICES_JSON_PATH,
})
