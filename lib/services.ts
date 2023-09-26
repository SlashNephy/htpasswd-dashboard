import { readFile } from 'fs/promises'

import { z } from 'zod'

import { env } from './config'

const schema = z
  .object({
    key: z.string(),
    name: z.string(),
    description: z.string().optional(),
    urls: z.object({
      app: z.string(),
      logo: z.string(),
      api_base: z.string(),
      example_api: z.string(),
    }),
    backend: z.object({
      kubernetes: z
        .object({
          namespace: z.string(),
          name: z.string(),
        })
        .optional(),
      file: z
        .object({
          path: z.string(),
        })
        .optional(),
    }),
  })
  .array()

export type Service = z.infer<typeof schema>[0]

export const loadServices = async (): Promise<Service[]> => {
  const content = await readFile(env.SERVICES_JSON_PATH, 'utf-8')
  const data = JSON.parse(content)

  return schema.parseAsync(data)
}
