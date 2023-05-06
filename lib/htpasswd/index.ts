import { HtpasswdFileBackend } from './HtpasswdFileBackend'
import { KubernetesSecretBackend } from './KubernetesSecretBackend'
import { loadServices } from '../services'

export type Credential = {
  username: string
  password: string
}

export type HtpasswdBackend = {
  has(username: string): Promise<boolean>
  append(username: string): Promise<Credential>
}

export const getHtpasswdInstance = async (
  serviceKey: string
): Promise<HtpasswdBackend | undefined> => {
  const services = await loadServices()
  const service = services.find((s) => s.key === serviceKey)
  if (service === undefined) {
    return
  }

  if (service.backend.file !== undefined) {
    return new HtpasswdFileBackend(service.backend.file.path)
  }

  if (service.backend.kubernetes !== undefined) {
    return new KubernetesSecretBackend(
      service.backend.kubernetes.namespace,
      service.backend.kubernetes.name
    )
  }
}
