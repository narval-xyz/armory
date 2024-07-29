import { faTrash, faUnlink } from '@fortawesome/free-solid-svg-icons'
import { AccountEntity, AccountType } from '@narval/policy-engine-shared'
import Card from './Card'
import CardButton from './CardActionButton'

interface AccountCardProps {
  account: AccountEntity
  onDeleteClick?: () => void
  onUnassignClick?: () => void
}

const getChainId = (chainId: number): string => {
  const chains: Record<number, string> = {
    1: 'Ethereum Mainnet',
    3: 'Ropsten Testnet',
    4: 'Rinkeby Testnet',
    5: 'Goerli Testnet',
    42: 'Kovan Testnet',
    56: 'Binance Smart Chain Mainnet',
    97: 'Binance Smart Chain Testnet',
    137: 'Polygon Mainnet',
    80001: 'Mumbai Testnet (Polygon)',
    43113: 'Avalanche Fuji Testnet',
    43114: 'Avalanche Mainnet',
    250: 'Fantom Opera',
    4002: 'Fantom Testnet',
    42161: 'Arbitrum One',
    421611: 'Arbitrum Testnet',
    10: 'Optimism Mainnet',
    69: 'Optimism Kovan Testnet'
  }

  return chains[chainId] ? chains[chainId] : `Chain ID: ${chainId}`
}

export default function AccountCardProps({ account, onDeleteClick, onUnassignClick }: AccountCardProps) {
  return (
    <Card>
      <div className="flex grow items-center gap-4">
        <span className="w-[400px] truncate">{account.address}</span>
        <span
          className={`flex items-center h-[24px] px-[12px] text-nv-2xs rounded-full text-nv-black bg-nar-gray-light/75`}
        >
          {account.accountType === AccountType.EOA ? 'EOA' : 'Smart Account'}
        </span>
        {account.chainId && <span className="text-white/50">{getChainId(account.chainId)}</span>}
      </div>

      {(onDeleteClick || onUnassignClick) && (
        <div className="flex items-center gap-2">
          {onDeleteClick && <CardButton icon={faTrash} onClick={onDeleteClick} alt="Delete account" />}

          {onUnassignClick && <CardButton icon={faUnlink} onClick={onUnassignClick} alt="Unassign account" />}
        </div>
      )}
    </Card>
  )
}
