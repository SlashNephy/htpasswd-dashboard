import { HtpasswdFileBackend } from './HtpasswdFileBackend'
import { KubernetesSecretBackend } from './KubernetesSecretBackend'
import { env } from '../config'

export type Credential = {
  username: string
  password: string
}

export type HtpasswdBackend = {
  has(username: string): Promise<boolean>
  append(username: string): Promise<Credential>
}

export const getHtpasswdInstance = (
  serviceKey: string
): HtpasswdBackend | undefined => {
  switch (serviceKey) {
    case 'mirakurun':
      if (env.MIRAKURUN_HTPASSWD_PATH !== undefined) {
        return new HtpasswdFileBackend(env.MIRAKURUN_HTPASSWD_PATH)
      }

      if (
        env.MIRAKURUN_K8S_NAMESPACE !== undefined &&
        env.MIRAKURUN_K8S_SECRET_NAME !== undefined
      ) {
        return new KubernetesSecretBackend(
          env.MIRAKURUN_K8S_NAMESPACE,
          env.MIRAKURUN_K8S_SECRET_NAME
        )
      }
      return

    case 'epgstation':
      if (env.EPGSTATION_HTPASSWD_PATH !== undefined) {
        return new HtpasswdFileBackend(env.EPGSTATION_HTPASSWD_PATH)
      }

      if (
        env.EPGSTATION_K8S_NAMESPACE !== undefined &&
        env.EPGSTATION_K8S_SECRET_NAME !== undefined
      ) {
        return new KubernetesSecretBackend(
          env.EPGSTATION_K8S_NAMESPACE,
          env.EPGSTATION_K8S_SECRET_NAME
        )
      }

      return
  }
}
