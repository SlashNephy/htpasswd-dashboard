export type HtpasswdEntry =
  | {
      username: string
      hashedPassword: string
    }
  | {
      comment: string
    }

// @ は URI エンコードが必要なので避ける
export const escapeUsername = (username: string): string => {
  return username.replace('@', '.')
}

export const encodeHtpasswd = (entries: HtpasswdEntry[]): string => {
  return entries
    .map((entry) => {
      if ('username' in entry) {
        return `${entry.username}:${entry.hashedPassword}`
      } else {
        return entry.comment
      }
    })
    .join('\n')
    .trim()
}

export const decodeHtpasswd = (content: string): HtpasswdEntry[] => {
  const entries: HtpasswdEntry[] = []
  for (const line of content.split('\n')) {
    if (line.startsWith('#') || !line.includes(':')) {
      entries.push({
        comment: line,
      })
      continue
    }

    const [username, hashedPassword] = line.split(':', 2)
    entries.push({
      username,
      hashedPassword,
    })
  }

  return entries
}
