import { faTrash, faUnlink } from '@fortawesome/free-solid-svg-icons'
import { AccountEntity } from '@narval/armory-sdk'
import NarIconButtonWithTooltip from '../../../_design-system/NarIconButtonWithTooltip'

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
    <div className="flex items-center w-full">
      <div className="flex grow">
        <span className="w-[400px] truncate">{account.address}</span>
      </div>
      {(onDeleteClick || onUnassignClick) && (
        <div className="flex items-center gap-2">
          {onDeleteClick && <NarIconButtonWithTooltip icon={faTrash} onClick={onDeleteClick} alt="Delete account" />}
          {onUnassignClick && (
            <NarIconButtonWithTooltip icon={faUnlink} onClick={onUnassignClick} alt="Unassign account" />
          )}
        </div>
      )}
    </div>
  )
}
