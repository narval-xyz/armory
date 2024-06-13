import { Permission } from '@narval/armory-sdk'
import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { ApplicationException } from '../../../../shared/exception/application.exception'
import { AdminService } from '../../../core/service/admin.service'
import { ImportService } from '../../../core/service/import.service'
import { KeyGenerationService } from '../../../core/service/key-generation.service'
import { AccountsDto } from '../dto/accounts.dto'
import { DeriveAccountDto, DeriveAccountResponseDto } from '../dto/derive-account.dto'
import { GenerateKeyResponseDto } from '../dto/generate-key-response.dto'
import { ImportPrivateKeyResponseDto } from '../dto/import-private-key-response.dto'
import { ImportPrivateKeyDto } from '../dto/import-private-key.dto'

@Controller('/accounts')
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID,
  required: true
})
export class AccountController {
  constructor(
    private keyGenService: KeyGenerationService,
    private importService: ImportService,
    private adminService: AdminService
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lists the client accounts'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AccountsDto
  })
  async getAccounts(@ClientId() clientId: string): Promise<AccountsDto> {
    const accounts = await this.adminService.getAccounts(clientId)

    return AccountsDto.create({ accounts })
  }

  @Post()
  @PermissionGuard(Permission.WALLET_CREATE)
  @ApiOperation({
    summary: 'Add a new account to a wallet'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: GenerateKeyResponseDto
  })
  async generateKey(@ClientId() clientId: string, @Body() body: DeriveAccountDto) {
    const accounts = await this.keyGenService.derive(clientId, body)
    const response = DeriveAccountResponseDto.create(accounts)

    return response
  }

  @Post('/import')
  @PermissionGuard(Permission.WALLET_IMPORT)
  @ApiOperation({
    summary: 'Imports an account'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: GenerateKeyResponseDto
  })
  async importPrivateKey(
    @ClientId() clientId: string,
    @Body() body: ImportPrivateKeyDto
  ): Promise<ImportPrivateKeyResponseDto> {
    let importedKey
    if (body.encryptedPrivateKey) {
      importedKey = await this.importService.importEncryptedPrivateKey(
        clientId,
        body.encryptedPrivateKey,
        body.accountId
      )
    } else if (body.privateKey) {
      importedKey = await this.importService.importPrivateKey(clientId, body.privateKey, body.accountId)
    } else {
      throw new ApplicationException({
        message: 'Missing privateKey or encryptedPrivateKey',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
      })
    }

    const response = new ImportPrivateKeyResponseDto(importedKey)

    return response
  }
}
