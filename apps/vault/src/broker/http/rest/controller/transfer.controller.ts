import { ApiClientIdHeader } from '@narval/nestjs-shared'
import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { TransferService } from '../../../core/service/transfer.service'
import { REQUEST_HEADER_CONNECTION_ID } from '../../../shared/constant'
import { ConnectionId } from '../../../shared/decorator/connection-id.decorator'
import { SendTransferDto } from '../dto/request/send-transfer.dto'
import { TransferDto } from '../dto/response/transfer.dto'

@Controller({
  path: 'transfers',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @PermissionGuard(VaultPermission.CONNECTION_WRITE)
  @ApiOperation({
    summary: 'Send a transfer',
    description: "This endpoint sends a transfer to the source's provider."
  })
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed',
    required: true
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The transfer was successfully sent.',
    type: TransferDto
  })
  async send(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Body() body: SendTransferDto
  ): Promise<TransferDto> {
    const internalTransfer = await this.transferService.send({ clientId, connectionId }, body)

    return TransferDto.create({ data: internalTransfer })
  }

  @Get(':transferId')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Retrieve transfer details',
    description: 'This endpoint retrieves the details of a specific transfer using its ID.'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed',
    required: true
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The transfer details were successfully retrieved.',
    type: TransferDto
  })
  async getById(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('transferId') transferId: string
  ) {
    const internalTransfer = await this.transferService.findById({ clientId, connectionId }, transferId)

    return TransferDto.create({ data: internalTransfer })
  }
}
