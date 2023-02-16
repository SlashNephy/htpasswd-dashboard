import { Mutex } from 'async-mutex'

import { EPGStationHtpasswd, MirakurunHtpasswd } from '../../../lib/htpasswd'
import { validateJwtPayload } from '../hello'

import type { ApiResponse } from '../type'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

export type StatusResponse = ApiResponse<{
  found: boolean
}>

export type IssueResponse = ApiResponse<{
  username: string
  token: string
}>

const mutex = new Mutex()

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse | IssueResponse>
) => {
  const { slug } = req.query
  if (!Array.isArray(slug) || slug.length !== 2) {
    res.status(404)
    return
  }

  const [service, request] = slug

  try {
    const payload = await validateJwtPayload(req.headers)
    switch (request) {
      case 'status':
        switch (service) {
          case 'epgstation': {
            res.status(200).json({
              success: true,
              found: await EPGStationHtpasswd.has(payload.email),
            })
            return
          }
          case 'mirakurun': {
            res.status(200).json({
              success: true,
              found: await MirakurunHtpasswd.has(payload.email),
            })
            return
          }
        }
        break
      case 'issue':
        if (req.method !== 'PUT') {
          res.status(405).json({
            success: false,
            error: 'Method Not Allowed',
          })
          return
        }

        // 書き込みオペレーションを同時に処理できないようにする
        await mutex.runExclusive(async () => {
          switch (service) {
            case 'epgstation':
              res.status(200).json({
                success: true,
                ...(await EPGStationHtpasswd.append(payload.email)),
              })
              break
            case 'mirakurun':
              res.status(200).json({
                success: true,
                ...(await MirakurunHtpasswd.append(payload.email)),
              })
              break
          }
        })
        break
    }

    res.status(404)
  } catch (error: unknown) {
    console.error(error)
    res.status(403).json({ success: false, error: `${error}` })
  }
}

export default handler
