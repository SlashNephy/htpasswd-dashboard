import { isDebug } from '../../lib/isDebug'
import { validateJwt } from '../../lib/jwt'

import type { CloudflareJwt } from '../../lib/jwt'
import type { ApiResponse } from './type'
import type { IncomingHttpHeaders } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'

export type HelloResponse = ApiResponse<CloudflareJwt>

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<HelloResponse>
) => {
  try {
    const payload = await validateJwtPayload(req.headers)

    res.status(200).json({
      success: true,
      ...payload,
    })
  } catch (error) {
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
  if (!token) {
    throw new Error('No token provided.')
  }

  return await validateJwt(token)
}

const extractJwt = (headers: IncomingHttpHeaders): string | undefined => {
  if (isDebug) {
    return process.env.CF_JWT
  }

  const value = headers['cf-access-jwt-assertion']
  if (typeof value !== 'string') {
    return undefined
  }

  return value
}

export default handler
