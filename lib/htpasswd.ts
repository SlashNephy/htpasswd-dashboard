import { readFile, lstat, writeFile } from 'fs/promises'

import { genSalt, hash } from 'bcrypt'
import { nanoid } from 'nanoid'

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

  constructor(path: string) {
    this.path = path
  }

  private async parse(): Promise<HtpasswdEntry[]> {
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

  private async exists(): Promise<boolean> {
    try {
      return !!(await lstat(this.path))
    } catch {
      return false
    }
  }

  async has(username: string): Promise<boolean> {
    const escapedUsername = HtpasswdFile.escapeUsername(username)
    const entries = await this.parse()
    return entries.some(
      (entry) => 'username' in entry && entry.username === escapedUsername
    )
  }

  private static async hashToken(token: string): Promise<string> {
    const salt = await genSalt(5)

    return await hash(token, salt)
  }

  private static async issueToken(): Promise<{
    token: string
    hashedToken: string
  }> {
    const token = nanoid(64)
    const hashedToken = await HtpasswdFile.hashToken(token)

    return {
      token,
      hashedToken,
    }
  }

  // @ は URI エンコードが必要なので避ける
  private static escapeUsername(username: string): string {
    return username.replace('@', '.')
  }

  async append(username: string): Promise<{ username: string; token: string }> {
    const { token, hashedToken } = await HtpasswdFile.issueToken()

    const escapedUsername = HtpasswdFile.escapeUsername(username)
    const entry = {
      username: escapedUsername,
      token: hashedToken,
    }

    const entries = await this.parse()
    const index = entries.findIndex(
      (entry) => 'username' in entry && entry.username === escapedUsername
    )
    if (index >= 0) {
      entries[index] = entry
    } else {
      entries.push(entry)
    }

    await this.write(entries)

    return {
      username: escapedUsername,
      token,
    }
  }

  private async write(entries: HtpasswdEntry[]): Promise<void> {
    const content = entries
      .map((entry) => {
        if ('username' in entry) {
          return `${entry.username}:${entry.token}`
        } else {
          return entry.comment
        }
      })
      .join('\n')

    await writeFile(this.path, content)
  }
}

const EPGSTATION_HTPASSWD_PATH = process.env.EPGSTATION_HTPASSWD_PATH
if (!EPGSTATION_HTPASSWD_PATH) {
  throw new Error('EPGSTATION_HTPASSWD_PATH is not defined')
}

const MIRAKURUN_HTPASSWD_PATH = process.env.MIRAKURUN_HTPASSWD_PATH
if (!MIRAKURUN_HTPASSWD_PATH) {
  throw new Error('MIRAKURUN_HTPASSWD_PATH is not defined')
}

export const EPGStationHtpasswd = new HtpasswdFile(EPGSTATION_HTPASSWD_PATH)
export const MirakurunHtpasswd = new HtpasswdFile(MIRAKURUN_HTPASSWD_PATH)
