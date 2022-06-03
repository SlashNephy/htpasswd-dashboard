export type ApiResponse<T> =
  | (T & {
      success: true
    })
  | {
      success: false
      error: string
    }
