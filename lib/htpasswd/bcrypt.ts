import { genSalt, hash } from 'bcrypt'
import { nanoid } from 'nanoid'

export const generatePassword = (): string => {
  return nanoid(64)
}

export const generateHash = async (data: string): Promise<string> => {
  const salt = await genSalt(5)
  return await hash(data, salt)
}

// @ は URI エンコードが必要なので避ける
export const escapeUsername = (username: string): string => {
  return username.replace('@', '.')
}

export const encodeBase64 = (data: string): string => {
  return Buffer.from(data).toString('base64')
}
