import { Injectable, NotFoundException } from '@nestjs/common'
import { ProviderTransfer } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import {
  InternalTransfer,
  TransferPartyType,
  TransferStatus,
  isAddressDestination
} from '../../core/type/transfer.type'

@Injectable()
export class TransferRepository {
  constructor(private prismaService: PrismaService) {}

  static parseEntity(entity: InternalTransfer): ProviderTransfer {
    return {
      assetId: entity.assetId,
      clientId: entity.clientId,
      createdAt: entity.createdAt,
      customerRefId: entity.customerRefId,
      destinationAddressRaw: null, // TODO
      externalId: entity.externalId,
      id: entity.transferId,
      idempotenceId: entity.idempotenceId,
      memo: entity.memo,
      grossAmount: entity.grossAmount,
      networkFeeAttribution: entity.networkFeeAttribution,
      provider: entity.provider,
      providerSpecific: PrismaService.toStringJson(entity.providerSpecific),
      ...(entity.source.type === TransferPartyType.WALLET
        ? {
            sourceWalletId: entity.source.id
          }
        : {
            sourceWalletId: null
          }),
      ...(entity.source.type === TransferPartyType.ACCOUNT
        ? {
            sourceAccountId: entity.source.id
          }
        : {
            sourceAccountId: null
          }),
      ...(entity.source.type === TransferPartyType.ADDRESS
        ? {
            sourceAddressId: entity.source.id
          }
        : {
            sourceAddressId: null
          }),
      ...(!isAddressDestination(entity.destination) && entity.destination.type === TransferPartyType.WALLET
        ? {
            destinationWalletId: entity.destination.id
          }
        : {
            destinationWalletId: null
          }),
      ...(!isAddressDestination(entity.destination) && entity.destination.type === TransferPartyType.ACCOUNT
        ? {
            destinationAccountId: entity.destination.id
          }
        : {
            destinationAccountId: null
          }),
      ...(!isAddressDestination(entity.destination) && entity.destination.type === TransferPartyType.ADDRESS
        ? {
            destinationAddressId: entity.destination.id
          }
        : {
            destinationAddressId: null
          }),
      ...(isAddressDestination(entity.destination)
        ? {
            destinationAddressRaw: entity.destination.address
          }
        : {})
    }
  }

  static parseModel(model: ProviderTransfer): InternalTransfer {
    return InternalTransfer.parse({
      assetId: model.assetId,
      clientId: model.clientId,
      createdAt: model.createdAt,
      customerRefId: model.customerRefId,
      externalId: model.externalId,
      grossAmount: model.grossAmount,
      idempotenceId: model.idempotenceId,
      memo: model.memo,
      networkFeeAttribution: model.networkFeeAttribution,
      provider: model.provider,
      providerSpecific: PrismaService.toJson(model.providerSpecific),
      status: TransferStatus.PROCESSING,
      transferId: model.id,
      source: {
        ...(model.sourceWalletId
          ? {
              type: TransferPartyType.WALLET,
              id: model.sourceWalletId
            }
          : {}),
        ...(model.sourceAccountId
          ? {
              type: TransferPartyType.ACCOUNT,
              id: model.sourceAccountId
            }
          : {}),
        ...(model.sourceAddressId
          ? {
              type: TransferPartyType.ADDRESS,
              id: model.sourceAddressId
            }
          : {})
      },
      destination: {
        ...(model.destinationWalletId
          ? {
              type: TransferPartyType.WALLET,
              id: model.destinationWalletId
            }
          : {}),
        ...(model.destinationAccountId
          ? {
              type: TransferPartyType.ACCOUNT,
              id: model.destinationAccountId
            }
          : {}),
        ...(model.destinationAddressId
          ? {
              type: TransferPartyType.ADDRESS,
              id: model.destinationAddressId
            }
          : {}),
        ...(model.destinationAddressRaw
          ? {
              address: model.destinationAddressRaw
            }
          : {})
      }
    })
  }

  async bulkCreate(transfers: InternalTransfer[]): Promise<InternalTransfer[]> {
    await this.prismaService.providerTransfer.createMany({
      data: transfers.map((transfer) => {
        return {
          ...TransferRepository.parseEntity(transfer),
          providerSpecific: PrismaService.toStringJson(transfer.providerSpecific)
        }
      })
    })

    return transfers
  }

  async findById(clientId: string, transferId: string): Promise<InternalTransfer> {
    const model = await this.prismaService.providerTransfer.findUnique({
      where: {
        clientId,
        id: transferId
      }
    })

    if (model) {
      return TransferRepository.parseModel(model)
    }

    throw new NotFoundException({
      message: 'Transfer not found',
      context: { transferId }
    })
  }
}
