import { verify } from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'
import { z } from 'zod'

import type { GetPublicKeyOrSecret, JwtPayload } from 'jsonwebtoken'

const schema = z.object({
  CF_TEAM_DOMAIN: z.string(),
  CF_APP_AUDIENCE: z.string(),
})

const env = schema.parse({
  CF_TEAM_DOMAIN: process.env.CF_TEAM_DOMAIN,
  CF_APP_AUDIENCE: process.env.CF_APP_AUDIENCE,
})

const client = new JwksClient({
  jwksUri: `https://${env.CF_TEAM_DOMAIN}/cdn-cgi/access/certs`,
  cacheMaxAge: 3600,
})

const getKey: GetPublicKeyOrSecret = (header, callback) => {
  client.getSigningKey(header.kid, (error, key) => {
    const signingKey = key?.getPublicKey()
    callback(null, signingKey)
  })
}

export const validateJwt = async (token: string): Promise<CloudflareJwt> => {
  return new Promise((resolve, reject) => {
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
}

export type CloudflareJwt = JwtPayload & {
  aud: string[]
  email: string
  exp: number
  iat: number
  nbf: number
  iss: string
  type: string
  identity_nonce: string
  sub: string
  country: string
}
