import { verify } from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'

import type { GetPublicKeyOrSecret, JwtPayload } from 'jsonwebtoken'
import type { CertSigningKey, RsaSigningKey } from 'jwks-rsa'

const getCertsUrl = (): string => {
  const domain = process.env.CF_TEAM_DOMAIN
  if (!domain) {
    throw new Error('CF_TEAM_DOMAIN is not set')
  }

  return `https://${domain}/cdn-cgi/access/certs`
}

const client = new JwksClient({
  jwksUri: getCertsUrl(),
  cacheMaxAge: 3600,
})

const getKey: GetPublicKeyOrSecret = (header, callback) => {
  client.getSigningKey(header.kid, (error, key) => {
    const certKey = key as CertSigningKey
    const rsaKey = key as RsaSigningKey
    const signingKey = certKey?.publicKey || rsaKey?.rsaPublicKey
    callback(null, signingKey)
  })
}

const getAudience = (): string => {
  const audience = process.env.CF_APP_AUDIENCE
  if (!audience) {
    throw new Error('CF_APP_AUDIENCE is not set')
  }

  return audience
}

export const validateJwt = async (token: string): Promise<CloudflareJwt> => {
  const audience = getAudience()

  return {
    then: (resolve, reject) => {
      verify(
        token,
        getKey,
        {
          audience,
          algorithms: ['RS256'],
        },
        (error, decoded) => {
          if (resolve && decoded) {
            void resolve(decoded as CloudflareJwt)
          }

          if (reject && error) {
            void reject(error)
          }
        }
      )
    },
  }
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
