import { CoreV1Api, HttpError, KubeConfig } from '@kubernetes/client-node'

export class KubernetesApiClient {
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
