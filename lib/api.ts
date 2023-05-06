import type { Credential } from './htpasswd/backend'
import type { CloudflareJwt } from './jwt'

export type ApiResponse<T> =
  | (T & {
      success: true
    })
  | {
      success: false
    }

export type HelloResponse = ApiResponse<CloudflareJwt>

export type StatusResponse = ApiResponse<{
  found: boolean
}>

export type IssueResponse = ApiResponse<Credential>
