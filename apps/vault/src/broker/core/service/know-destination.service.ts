import { PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import {
  FindAllOptions,
  KnownDestinationRepository,
  UpdateKnownDestination
} from '../../persistence/repository/known-destination.repository'
import { KnownDestination } from '../type/indexed-resources.type'

@Injectable()
export class KnownDestinationService {
  constructor(private readonly knownDestinationRepository: KnownDestinationRepository) {}

  async getKnownDestinations(
    clientId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<KnownDestination>> {
    return this.knownDestinationRepository.findByClientId(clientId, options)
  }

  async getKnownDestination(clientId: string, KnownDestinationId: string): Promise<KnownDestination> {
    return this.knownDestinationRepository.findById(clientId, KnownDestinationId)
  }

  async bulkCreate(knownDestinations: KnownDestination[]): Promise<KnownDestination[]> {
    return this.knownDestinationRepository.bulkCreate(knownDestinations)
  }

  async bulkDelete(knownDestinationId: KnownDestination[]): Promise<number> {
    return this.knownDestinationRepository.bulkDelete(knownDestinationId)
  }

  async bulkUpdate(knownDestinations: KnownDestination[]): Promise<KnownDestination[]> {
    return Promise.all(
      knownDestinations.map((knownDestination) => this.update(knownDestination.knownDestinationId, knownDestination))
    )
  }
  async update(knownDestinationId: string, data: UpdateKnownDestination): Promise<KnownDestination> {
    return this.knownDestinationRepository.update(knownDestinationId, data)
  }

  async findAll(clientId: string, opts?: FindAllOptions): Promise<PaginatedResult<KnownDestination>> {
    return this.knownDestinationRepository.findAll(clientId, opts)
  }
}
