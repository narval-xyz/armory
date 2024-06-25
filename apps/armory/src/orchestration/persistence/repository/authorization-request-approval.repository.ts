import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client/armory'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class AuthorizationRequestApprovalRepository {
  constructor(private prismaService: PrismaService) {}

  async updateMany({
    requestId,
    sig,
    error
  }: {
    requestId: string
    sig: string
    error: Prisma.InputJsonValue
  }): Promise<void> {
    await this.prismaService.authorizationRequestApproval.updateMany({
      where: { requestId, sig },
      data: { error }
    })
  }
}
