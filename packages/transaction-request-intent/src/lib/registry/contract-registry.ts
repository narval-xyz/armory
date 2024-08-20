import { addressSchema, AssetType, ChainAccountId } from '@narval/policy-engine-shared'
import z from 'zod'
import { WalletType } from '../domain'
import { toChainAccountIdLowerCase } from '../utils'

// Define Zod schema for ContractInformation
export const ContractInformation = z.object({
  factoryType: z.nativeEnum(WalletType).optional(),
  assetType: z.nativeEnum(AssetType).optional()
})
export type ContractInformation = z.infer<typeof ContractInformation>

// Define Zod schema for ContractRegistryInput
export const ContractRegistryInput = z.array(
  z.object({
    contract: z.object({
      address: z
        .string()
        .transform((val) => val.toLowerCase())
        .pipe(addressSchema),
      chainId: z.number().int().positive()
    }),
    assetType: z.nativeEnum(AssetType).optional(),
    factoryType: z.nativeEnum(WalletType).optional()
  })
)
export type ContractRegistryInput = z.infer<typeof ContractRegistryInput>

export class ContractRegistry extends Map<ChainAccountId, ContractInformation> {
  constructor(input?: ContractRegistryInput) {
    if (!input) {
      super()
      return
    }
    const validInput = ContractRegistryInput.parse(input)
    const entries = validInput.map(({ contract, assetType, factoryType }): [ChainAccountId, ContractInformation] => {
      const contractId = toChainAccountIdLowerCase(contract)
      const contractInfo = ContractInformation.parse({
        assetType,
        factoryType
      })

      return [contractId, contractInfo]
    })

    super(entries)
  }
}
