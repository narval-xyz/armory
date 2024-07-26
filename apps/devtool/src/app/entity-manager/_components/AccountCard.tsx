import { AccountEntity, AccountType } from "@narval/policy-engine-shared"
import NarIconButton from "../../_design-system/NarIconButton"
import { faTrash } from "@fortawesome/free-solid-svg-icons"
import Card from "./Card"
import CardButton from "./CardActionButton"

interface AccountCardProps {
  account: AccountEntity
  onDeleteClick: () => void
}

const getChainId = (chainId: number): string => {
  const chains: Record<number, string> = {
    1: "Ethereum Mainnet",
    3: "Ropsten Testnet",
    4: "Rinkeby Testnet",
    5: "Goerli Testnet",
    42: "Kovan Testnet",
    56: "Binance Smart Chain Mainnet",
    97: "Binance Smart Chain Testnet",
    137: "Polygon Mainnet",
    80001: "Mumbai Testnet (Polygon)",
    43113: "Avalanche Fuji Testnet",
    43114: "Avalanche Mainnet",
    250: "Fantom Opera",
    4002: "Fantom Testnet",
    42161: "Arbitrum One",
    421611: "Arbitrum Testnet",
    10: "Optimism Mainnet",
    69: "Optimism Kovan Testnet"
  }

  return chains[chainId] ? chains[chainId] : `Chain ID: ${chainId}`
}

const getAccountTypeColor = (accountType: AccountType): string => {
  const colors: Record<AccountType, string> = {
    [AccountType.AA]: 'text-nv-black bg-nv-green-400',
    [AccountType.EOA]: 'text-nv-black bg-nv-blue-400'
  }

  return colors[accountType] ? colors[accountType] : 'text-nv-black bg-nv-white'
};

export default function AccountCardProps({ account, onDeleteClick }: AccountCardProps) {
  return (
    <Card>
      <div className="flex grow items-center gap-4">
        <span className="w-[400px] truncate">{account.address}</span>
        <span className={`flex items-center h-[24px] px-[12px] text-nv-2xs rounded-full ${getAccountTypeColor(account.accountType)}`}>
          {account.accountType === AccountType.EOA ? 'EOA' : 'Smart Account'}
        </span>
        {account.chainId && (
          <span className="text-white/50">{getChainId(account.chainId)}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <CardButton
          icon={faTrash}
          onClick={onDeleteClick}
          alt="Delete account"
        />
      </div>
    </Card>
  )
}
