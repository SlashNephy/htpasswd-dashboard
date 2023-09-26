import { Mutex } from 'async-mutex'
import { StatusCodes } from 'http-status-codes'

import { getHtpasswdBackendInstance } from '../../../lib/htpasswd/backend'
import { validateJwt } from '../hello'

import type { IssueResponse } from '../../../lib/api'
import type { NextApiHandler } from 'next'

const mutex = new Mutex()

export const handler: NextApiHandler<IssueResponse> = async (req, res) => {
  if (req.method !== 'PUT') {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
      success: false,
    })

    return
  }

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
    // 書き込みオペレーションを同時に処理できないようにする
    await mutex.runExclusive(async () => {
      const credential = await htpasswd.append(email)

      res.status(StatusCodes.OK).json({
        success: true,
        ...credential,
      })
    })
  } catch (e: unknown) {
    console.error(e)

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
    })
  }
}

export default handler
