import { CoreV1Api, HttpError, KubeConfig } from '@kubernetes/client-node'

import { decodeBase64, encodeBase64 } from './base64'
import { decodeHtpasswd, encodeHtpasswd, escapeUsername } from './htpasswd'
import { generateHash, generatePassword } from './password'

import type { Credential, HtpasswdBackend } from './index'

type TraefikBasicAuthSecret = {
  users?: string
}

export class KubernetesSecretBackend implements HtpasswdBackend {
  private readonly api: KubernetesApiClient

  public constructor(public namespace: string, public name: string) {
    this.api = new KubernetesApiClient()
  }

  public async has(username: string): Promise<boolean> {
    const secret = await this.api.getSecret<TraefikBasicAuthSecret>(
      this.name,
      this.namespace
    )
    if (secret?.users === undefined) {
      return false
    }

    const escapedUsername = escapeUsername(username)

    const users = decodeBase64(secret.users)
    const entries = decodeHtpasswd(users)
    return entries.some(
      (entry) => 'username' in entry && entry.username === escapedUsername
    )
  }

  public async append(username: string): Promise<Credential> {
    const password = generatePassword()
    const hashedPassword = await generateHash(password)
    const escapedUsername = escapeUsername(username)

    const secret = await this.api.getSecret<TraefikBasicAuthSecret>(
      this.name,
      this.namespace
    )
    if (secret?.users === undefined) {
      await this.api.createSecret<TraefikBasicAuthSecret>(
        this.name,
        this.namespace,
        {
          users: encodeBase64(
            encodeHtpasswd([
              {
                username: escapedUsername,
                hashedPassword,
              },
            ])
          ),
        }
      )
    } else {
      const users = decodeBase64(secret.users)
      const entries = decodeHtpasswd(users)
      const index = entries.findIndex(
        (entry) => 'username' in entry && entry.username === escapedUsername
      )
      if (index < 0) {
        entries.push({
          username: escapedUsername,
          hashedPassword,
        })
      } else {
        entries[index] = {
          username: escapedUsername,
          hashedPassword,
        }
      }

      await this.api.patchSecret<TraefikBasicAuthSecret>(
        this.name,
        this.namespace,
        {
          users: encodeBase64(encodeHtpasswd(entries)),
        }
      )
    }

    return {
      username: escapedUsername,
      password,
    }
  }
}

class KubernetesApiClient {
  private readonly api: CoreV1Api

  public constructor() {
    const config = new KubeConfig()
    config.loadFromDefault()

    this.api = config.makeApiClient(CoreV1Api)
  }

  public async getSecret<T extends Record<string, string>>(
    name: string,
    namespace: string
  ): Promise<T | undefined> {
    try {
      const { body } = await this.api.readNamespacedSecret(name, namespace)

      return body.data as T | undefined
    } catch (e: unknown) {
      if (e instanceof HttpError && e.statusCode === 404) {
        return
      }

      throw e
    }
  }

  public async createSecret<T extends Record<string, string>>(
    name: string,
    namespace: string,
    data: T
  ) {
    await this.api.createNamespacedSecret(namespace, {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name,
        namespace,
      },
      data,
    })
  }

  public async patchSecret<T extends Record<string, string>>(
    name: string,
    namespace: string,
    data: T
  ) {
    await this.api.patchNamespacedSecret(
      name,
      namespace,
      {
        data,
      },
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
      }
    )
  }
}
