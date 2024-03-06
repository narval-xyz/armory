export interface DataStoreRepository {
  fetch<Data>(url: string): Promise<Data>
}
