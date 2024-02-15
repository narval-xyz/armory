export interface Seeder {
  germinate(): Promise<void>
}
