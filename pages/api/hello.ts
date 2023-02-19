import { StatusCodes } from 'http-status-codes'

import { env } from '../../lib/config'
import { validateCloudflareJwt } from '../../lib/jwt'

import type { HelloResponse } from '../../lib/api'
import type { CloudflareJwt } from '../../lib/jwt'
import type { IncomingHttpHeaders } from 'http'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler<HelloResponse> = async (req, res) => {
  try {
    const payload = await validateJwt(req.headers)

    res.status(StatusCodes.OK).json({
      success: true,
      ...payload,
    })
  } catch (error: unknown) {
    console.error(error)

    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
    })
  }
}

export const validateJwt = async (
  headers: IncomingHttpHeaders
): Promise<CloudflareJwt> => {
  const jwt = extractJwt(headers)
  if (jwt === undefined) {
    throw new Error('No JWT provided')
  }

  return await validateCloudflareJwt(jwt)
}

const extractJwt = (headers: IncomingHttpHeaders): string | undefined => {
  if (env.NODE_ENV === 'development') {
    return env.CF_JWT
  }

  const value = headers['cf-access-jwt-assertion']
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export default handler
