import { readFile, lstat, writeFile } from 'fs/promises'

import { genSalt, hash } from 'bcrypt'
import { nanoid } from 'nanoid'
import { z } from 'zod'

type HtpasswdEntry =
  | {
      username: string
      token: string
    }
  | {
      comment: string
    }

class HtpasswdFile {
  private readonly path: string

  public constructor(path: string) {
    this.path = path
  }

  private static async _hashToken(token: string): Promise<string> {
    const salt = await genSalt(5)

    return await hash(token, salt)
  }

  private static async _issueToken(): Promise<{
    token: string
    hashedToken: string
  }> {
    const token = nanoid(64)
    const hashedToken = await HtpasswdFile._hashToken(token)

    return {
      token,
      hashedToken,
    }
  }

  // @ は URI エンコードが必要なので避ける
  private static _escapeUsername(username: string): string {
    return username.replace('@', '.')
  }

  public async has(username: string): Promise<boolean> {
    const escapedUsername = HtpasswdFile._escapeUsername(username)
    const entries = await this._parse()
    return entries.some(
      (entry) => 'username' in entry && entry.username === escapedUsername
    )
  }

  public async append(
    username: string
  ): Promise<{ username: string; token: string }> {
    const { token, hashedToken } = await HtpasswdFile._issueToken()

    const escapedUsername = HtpasswdFile._escapeUsername(username)
    const entry = {
      username: escapedUsername,
      token: hashedToken,
    }

    const entries = await this._parse()
    const index = entries.findIndex(
      (entry) => 'username' in entry && entry.username === escapedUsername
    )
    if (index >= 0) {
      entries[index] = entry
    } else {
      entries.push(entry)
    }

    await this._write(entries)

    return {
      username: escapedUsername,
      token,
    }
  }

  private async _parse(): Promise<HtpasswdEntry[]> {
    if (!(await this._exists())) {
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

  private async _exists(): Promise<boolean> {
    try {
      return (await lstat(this.path)).isFile()
    } catch {
      return false
    }
  }

  private async _write(entries: HtpasswdEntry[]): Promise<void> {
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

const schema = z.object({
  MIRAKURUN_HTPASSWD_PATH: z.string(),
  EPGSTATION_HTPASSWD_PATH: z.string(),
})

const env = schema.parse({
  MIRAKURUN_HTPASSWD_PATH: process.env.MIRAKURUN_HTPASSWD_PATH,
  EPGSTATION_HTPASSWD_PATH: process.env.EPGSTATION_HTPASSWD_PATH,
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EPGStationHtpasswd = new HtpasswdFile(env.EPGSTATION_HTPASSWD_PATH)
export const MirakurunHtpasswd = new HtpasswdFile(env.MIRAKURUN_HTPASSWD_PATH)
