import { validateJwt } from '../../lib/jwt'

import type { ApiResponse } from './type'
import type { CloudflareJwt } from '../../lib/jwt'
import type { IncomingHttpHeaders } from 'http'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

export type HelloResponse = ApiResponse<CloudflareJwt>

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<HelloResponse>
) => {
  try {
    const payload = await validateJwtPayload(req.headers)

    res.status(200).json({
      success: true,
      ...payload,
    })
  } catch (error: unknown) {
    console.error(error)

    res.status(403).json({
      success: false,
      error: `${error}`,
    })
  }
}

export const validateJwtPayload = async (
  headers: IncomingHttpHeaders
): Promise<CloudflareJwt> => {
  const token = extractJwt(headers)
  if (token === undefined) {
    throw new Error('No token provided.')
  }

  return await validateJwt(token)
}

const extractJwt = (headers: IncomingHttpHeaders): string | undefined => {
  if (process.env.NODE_ENV !== 'production') {
    return process.env.CF_JWT
  }

  const value = headers['cf-access-jwt-assertion']
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export default handler
