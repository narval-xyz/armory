import { Injectable } from '@nestjs/common'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'

@Injectable()
export class EngineService {
  constructor(private clusterService: ClusterService) {}

  async syncEngineCluster(clientId: string) {
    return this.clusterService.sync(clientId)
  }
}
