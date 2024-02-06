export type Node = {
  id: string
  clusterId: string
  host: string
  port: number
  pubKey: string
}

export type Cluster = {
  id: string
  orgId: string
  nodes: Node[]
  size: number
}
