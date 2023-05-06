import { verify } from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'

import { env } from './config'

import type { GetPublicKeyOrSecret, JwtPayload } from 'jsonwebtoken'

export type CloudflareJwt = JwtPayload & {
  email: string
}

const client = new JwksClient({
  jwksUri: `https://${env.CF_TEAM_DOMAIN}/cdn-cgi/access/certs`,
  cacheMaxAge: 3600,
})

const getKey: GetPublicKeyOrSecret = (header, callback) => {
  client.getSigningKey(header.kid, (error, key) => {
    if (error) {
      callback(error)
      return
    }

    const signingKey = key?.getPublicKey()
    callback(null, signingKey)
  })
}

export const validateCloudflareJwt = async (
  token: string
): Promise<CloudflareJwt> =>
  new Promise((resolve, reject) => {
    verify(
      token,
      getKey,
      {
        audience: env.CF_APP_AUDIENCE,
        algorithms: ['RS256'],
      },
      (error, decoded) => {
        if (decoded !== undefined && typeof decoded !== 'string') {
          resolve(decoded as CloudflareJwt)
        } else {
          reject(error)
        }
      }
    )
  })
