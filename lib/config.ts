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

  MIRAKURUN_HTPASSWD_PATH: z.string().optional(),
  MIRAKURUN_K8S_SECRET_NAME: z.string().optional(),
  MIRAKURUN_K8S_NAMESPACE: z.string().optional(),
  EPGSTATION_HTPASSWD_PATH: z.string().optional(),
  EPGSTATION_K8S_SECRET_NAME: z.string().optional(),
  EPGSTATION_K8S_NAMESPACE: z.string().optional(),
})

export const env = schema.parse({
  NODE_ENV: process.env.NODE_ENV,

  CF_TEAM_DOMAIN: process.env.CF_TEAM_DOMAIN,
  CF_APP_AUDIENCE: process.env.CF_APP_AUDIENCE,
  CF_JWT: process.env.CF_JWT,

  MIRAKURUN_HTPASSWD_PATH: process.env.MIRAKURUN_HTPASSWD_PATH,
  MIRAKURUN_K8S_SECRET_NAME: process.env.MIRAKURUN_K8S_SECRET_NAME,
  MIRAKURUN_K8S_NAMESPACE: process.env.MIRAKURUN_K8S_NAMESPACE,
  EPGSTATION_HTPASSWD_PATH: process.env.EPGSTATION_HTPASSWD_PATH,
  EPGSTATION_K8S_SECRET_NAME: process.env.EPGSTATION_K8S_SECRET_NAME,
  EPGSTATION_K8S_NAMESPACE: process.env.EPGSTATION_K8S_NAMESPACE,
})
