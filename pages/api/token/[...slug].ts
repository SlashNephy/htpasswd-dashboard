import { Mutex } from 'async-mutex'

import { EPGStationHtpasswd, MirakurunHtpasswd } from '../../../lib/htpasswd'
import { validateJwtPayload } from '../hello'

import type { ApiResponse } from '../type'
import type { NextApiRequest, NextApiResponse } from 'next'

export type StatusResponse = ApiResponse<{
  found: boolean
}>

export type IssueResponse = ApiResponse<{
  username: string
  token: string
}>

const mutex = new Mutex()

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse | IssueResponse>
) => {
  const { slug } = req.query
  if (!Array.isArray(slug) || slug.length !== 2) {
    return res.status(404)
  }

  const [service, request] = slug

  try {
    const payload = await validateJwtPayload(req.headers)
    switch (request) {
      case 'status':
        switch (service) {
          case 'epgstation':
            return res.status(200).json({
              success: true,
              found: await EPGStationHtpasswd.has(payload.email),
            })
          case 'mirakurun':
            return res.status(200).json({
              success: true,
              found: await MirakurunHtpasswd.has(payload.email),
            })
        }
        break
      case 'issue':
        if (req.method !== 'PUT') {
          return res.status(405).json({
            success: false,
            error: 'Method Not Allowed',
          })
        }

        // 書き込みオペレーションを同時に処理できないようにする
        await mutex.runExclusive(async () => {
          switch (service) {
            case 'epgstation':
              return res.status(200).json({
                success: true,
                ...(await EPGStationHtpasswd.append(payload.email)),
              })
            case 'mirakurun':
              return res.status(200).json({
                success: true,
                ...(await MirakurunHtpasswd.append(payload.email)),
              })
          }
        })
        break
    }

    res.status(404)
  } catch (error) {
    console.error(error)
    res.status(403).json({ success: false, error: `${error}` })
  }
}

// eslint-disable-next-line import/no-default-export
export default handler
