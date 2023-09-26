import { StatusCodes } from 'http-status-codes'

import { getHtpasswdBackendInstance } from '../../../lib/htpasswd/backend'
import { validateJwt } from '../hello'

import type { StatusResponse } from '../../../lib/api'
import type { NextApiHandler } from 'next'

export const handler: NextApiHandler<StatusResponse> = async (req, res) => {
  const { service: key } = req.query
  const htpasswd = await getHtpasswdBackendInstance(key as string)
  if (htpasswd === undefined) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
    })

    return
  }

  let email: string
  try {
    const payload = await validateJwt(req.headers)
    email = payload.email
  } catch (error: unknown) {
    console.error(error)

    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
    })

    return
  }

  try {
    res.status(StatusCodes.OK).json({
      success: true,
      found: await htpasswd.has(email),
    })
  } catch (e: unknown) {
    console.error(e)

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
    })
  }
}

export default handler
