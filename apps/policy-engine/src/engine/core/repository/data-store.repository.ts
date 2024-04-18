export interface DataStoreRepository {
  fetch<Data>(url: string, headers?: Record<string, string>): Promise<Data>
}
