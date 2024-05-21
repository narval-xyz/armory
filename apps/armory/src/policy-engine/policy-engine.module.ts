import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { ClusterService } from './core/service/cluster.service'
import { PolicyEngineClient } from './http/client/policy-engine.client'
import { PolicyEngineNodeRepository } from './persistence/repository/policy-engine-node.repository'

const INFRASTRUCTURE_MODULES = [PersistenceModule, HttpModule]

@Module({
  imports: [...INFRASTRUCTURE_MODULES],
  providers: [ClusterService, PolicyEngineNodeRepository, PolicyEngineClient],
  exports: [ClusterService]
})
export class PolicyEngineModule {}
