import { HtpasswdFile } from './HtpasswdFile'
import { escapeUsername } from '../htpasswd'
import { generateHash, generatePassword } from '../password'

import type { Credential, HtpasswdBackend } from '../backend'

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
