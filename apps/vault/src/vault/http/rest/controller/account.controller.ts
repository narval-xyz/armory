import { Permission } from '@narval/armory-sdk'
import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { ApplicationException } from '../../../../shared/exception/application.exception'
import { PrivateAccount } from '../../../../shared/type/domain.type'
import { AdminService } from '../../../core/service/admin.service'
import { ImportService } from '../../../core/service/import.service'
import { KeyGenerationService } from '../../../core/service/key-generation.service'
import { AccountDto } from '../dto/account.dto'
import { AccountsDto } from '../dto/accounts.dto'
import { DeriveAccountDto, DeriveAccountResponseDto } from '../dto/derive-account.dto'
import { ImportPrivateKeyDto } from '../dto/import-private-key.dto'

@Controller({
  path: '/accounts',
  version: '1'
})
@ApiTags('Account')
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
  @PermissionGuard(Permission.WALLET_READ)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AccountsDto
  })
  async list(@ClientId() clientId: string): Promise<AccountsDto> {
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
    type: DeriveAccountResponseDto
  })
  async derive(@ClientId() clientId: string, @Body() body: DeriveAccountDto): Promise<DeriveAccountResponseDto> {
    const accounts = await this.keyGenService.derive(clientId, body)

    return DeriveAccountResponseDto.create(accounts)
  }

  @Post('/import')
  @PermissionGuard(Permission.WALLET_IMPORT)
  @ApiOperation({
    summary: 'Imports an account'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AccountDto
  })
  async importPrivateKey(@ClientId() clientId: string, @Body() body: ImportPrivateKeyDto): Promise<AccountDto> {
    let account: PrivateAccount
    if (body.encryptedPrivateKey) {
      account = await this.importService.importEncryptedPrivateKey(clientId, body.encryptedPrivateKey, body.accountId)
    } else if (body.privateKey) {
      account = await this.importService.importPrivateKey(clientId, body.privateKey, body.accountId)
    } else {
      throw new ApplicationException({
        message: 'Missing privateKey or encryptedPrivateKey',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
      })
    }

    return AccountDto.create(account)
  }
}
