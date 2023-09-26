import { hasLength } from 'ts-array-length'

export type HtpasswdEntry =
  | {
      username: string
      hashedPassword: string
    }
  | {
      comment: string
    }

// @ は URI エンコードが必要なので避ける
export const escapeUsername = (username: string): string =>
  username.replace('@', '.')

export const encodeHtpasswd = (entries: HtpasswdEntry[]): string =>
  entries
    .map((entry) => {
      if ('username' in entry) {
        return `${entry.username}:${entry.hashedPassword}`
      }

      return entry.comment
    })
    .join('\n')
    .trim()

export const decodeHtpasswd = (content: string): HtpasswdEntry[] => {
  const entries: HtpasswdEntry[] = []
  for (const line of content.split('\n')) {
    if (line.startsWith('#') || !line.includes(':')) {
      entries.push({
        comment: line,
      })
      continue
    }

    const fragments = line.split(':', 2)
    if (!hasLength(fragments, 2)) {
      continue
    }

    const [username, hashedPassword] = fragments
    entries.push({
      username,
      hashedPassword,
    })
  }

  return entries
}
