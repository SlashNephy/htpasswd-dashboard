import { lstat, readFile, writeFile } from 'fs/promises'

import { decodeHtpasswd, encodeHtpasswd } from '../htpasswd'

import type { HtpasswdEntry } from '../htpasswd'

export class HtpasswdFile {
  public constructor(public readonly path: string) {}

  public async exists(): Promise<boolean> {
    try {
      return (await lstat(this.path)).isFile()
    } catch {
      return false
    }
  }

  public async read(): Promise<HtpasswdEntry[]> {
    if (!(await this.exists())) {
      return []
    }

    const content = await readFile(this.path, 'utf8')

    return decodeHtpasswd(content)
  }

  public async write(entries: HtpasswdEntry[]): Promise<void> {
    const content = encodeHtpasswd(entries)
    await writeFile(this.path, `${content}\n`)
  }
}
