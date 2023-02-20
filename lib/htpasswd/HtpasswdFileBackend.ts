import { readFile, lstat, writeFile } from 'fs/promises'

import { decodeHtpasswd, encodeHtpasswd, escapeUsername } from './htpasswd'
import { generateHash, generatePassword } from './password'

import type { HtpasswdEntry } from './htpasswd'
import type { Credential, HtpasswdBackend } from './index'

export class HtpasswdFileBackend implements HtpasswdBackend {
  private readonly file: HtpasswdFile

  public constructor(path: string) {
    this.file = new HtpasswdFile(path)
  }

  public async has(username: string): Promise<boolean> {
    const escapedUsername = escapeUsername(username)
    const entries = await this.file.read()
    return entries.some(
      (entry) => 'username' in entry && entry.username === escapedUsername
    )
  }

  public async append(username: string): Promise<Credential> {
    const password = generatePassword()
    const hashedPassword = await generateHash(password)
    const escapedUsername = escapeUsername(username)

    const entries = await this.file.read()
    const index = entries.findIndex(
      (entry) => 'username' in entry && entry.username === escapedUsername
    )
    if (index >= 0) {
      entries[index] = {
        username: escapedUsername,
        hashedPassword,
      }
    } else {
      entries.push({
        username: escapedUsername,
        hashedPassword,
      })
    }

    await this.file.write(entries)

    return {
      username: escapedUsername,
      password,
    }
  }
}

class HtpasswdFile {
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
