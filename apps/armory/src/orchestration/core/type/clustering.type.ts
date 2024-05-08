export type Node = {
  id: string
  clusterId: string
  host: string
  port: number
  pubKey: string
}

export type Cluster = {
  id: string
  clientId: string
  nodes: Node[]
  size: number
}
