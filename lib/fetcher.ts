export const fetcher = async <T>(uri: string): Promise<T> => {
  const response = await fetch(uri)
  return await response.json()
}
