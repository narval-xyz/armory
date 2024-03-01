export const KeyValueRepository = Symbol('KeyValueRepository')

export interface KeyValueRepository {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<boolean>
  delete(key: string): Promise<boolean>
}
