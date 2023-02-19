import { readFile, lstat, writeFile } from 'fs/promises'

import { escapeUsername, generateHash, generatePassword } from './bcrypt'

import type { Credential, HtpasswdBackend } from './index'

export class HtpasswdFileBackend implements HtpasswdBackend {
  private readonly writer: HtpasswdWriter

  public constructor(path: string) {
    this.writer = new HtpasswdWriter(path)
  }

  public async has(username: string): Promise<boolean> {
    const escapedUsername = escapeUsername(username)
    const entries = await this.writer.read()
    return entries.some(
      (entry) => 'username' in entry && entry.username === escapedUsername
    )
  }

  public async append(username: string): Promise<Credential> {
    const password = generatePassword()
    const hashedPassword = await generateHash(password)
    const escapedUsername = escapeUsername(username)

    const entries = await this.writer.read()
    const index = entries.findIndex(
      (entry) => 'username' in entry && entry.username === escapedUsername
    )
    if (index >= 0) {
      entries[index] = {
        username: escapedUsername,
        token: hashedPassword,
      }
    } else {
      entries.push({
        username: escapedUsername,
        token: hashedPassword,
      })
    }

    await this.writer.write(entries)

    return {
      username: escapedUsername,
      password,
    }
  }
}

type HtpasswdEntry =
  | {
      username: string
      token: string
    }
  | {
      comment: string
    }

class HtpasswdWriter {
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

    const entries: HtpasswdEntry[] = []
    for (const line of content.split('\n')) {
      if (line.startsWith('#') || !line.includes(':')) {
        entries.push({
          comment: line,
        })
        continue
      }

      const [username, token] = line.split(':')
      entries.push({
        username,
        token,
      })
    }

    return entries
  }

  public async write(entries: HtpasswdEntry[]): Promise<void> {
    const content = entries
      .map((entry) => {
        if ('username' in entry) {
          return `${entry.username}:${entry.token}`
        } else {
          return entry.comment
        }
      })
      .join('\n')
      .trim()

    await writeFile(this.path, `${content}\n`)
  }
}
