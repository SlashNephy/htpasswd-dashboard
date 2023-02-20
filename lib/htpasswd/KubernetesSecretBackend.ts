import { CoreV1Api, HttpError, KubeConfig } from '@kubernetes/client-node'

import {
  encodeBase64,
  escapeUsername,
  generateHash,
  generatePassword,
} from './bcrypt'

import type { Credential, HtpasswdBackend } from './index'

export class KubernetesSecretBackend implements HtpasswdBackend {
  private readonly api: KubernetesApiClient

  public constructor(public namespace: string, public name: string) {
    this.api = new KubernetesApiClient()
  }

  public async has(username: string): Promise<boolean> {
    const secret = await this.api.getSecret(this.name, this.namespace)
    if (secret === undefined) {
      return false
    }

    const escapedUsername = escapeUsername(username)
    return escapedUsername in secret
  }

  public async append(username: string): Promise<Credential> {
    const password = generatePassword()
    const hashedPassword = await generateHash(password)
    const encodedPassword = encodeBase64(hashedPassword)
    const escapedUsername = escapeUsername(username)

    const secret = await this.api.getSecret(this.name, this.namespace)
    if (secret === undefined) {
      await this.api.createSecret(this.name, this.namespace, {
        [escapedUsername]: encodedPassword,
      })
    } else {
      await this.api.patchSecret(this.name, this.namespace, {
        [escapedUsername]: encodedPassword,
      })
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

  public async getSecret(
    name: string,
    namespace: string
  ): Promise<Record<string, string> | undefined> {
    try {
      const { body } = await this.api.readNamespacedSecret(name, namespace)

      return body.data
    } catch (e: unknown) {
      if (e instanceof HttpError && e.statusCode === 404) {
        return
      }

      throw e
    }
  }

  public async createSecret(
    name: string,
    namespace: string,
    data: Record<string, string>
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

  public async patchSecret(
    name: string,
    namespace: string,
    data: Record<string, string>
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
