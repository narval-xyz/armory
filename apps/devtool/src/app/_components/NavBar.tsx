'use client'

import { faPowerOff, faWallet } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import NarButton from '../_design-system/NarButton'
import NarCopyButton from '../_design-system/NarCopyButton'
import useAccountSignature from '../_hooks/useAccountSignature'
import { formatAddress } from '../_lib/utils'

const NavBar = () => {
  const currentPath = usePathname()
  const account = useAccount()
  const { jwk } = useAccountSignature()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <nav className="fixed top-0 left-0 z-40 h-[72px] w-full bg-nv-neutrals-900 border-b border-b-nv-neutrals-400">
      <div className="flex gap-[32px] items-center justify-end shrink-0 h-full px-[48px]">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image src="/narval-wordmark-white.png" width="150" height="50" alt="Narval Logo" priority />
          </Link>
          <div className="flex gap-8 ml-10 text-nv-lg">
            <Link href="/config" className={`${currentPath === '/config' ? 'underline' : ''}`}>
              Config
            </Link>
            <Link href="/data-store" className={`${currentPath === '/data-store' ? 'underline' : ''}`}>
              Data Store
            </Link>
            <Link href="/request-playground" className={`${currentPath === '/request-playground' ? 'underline' : ''}`}>
              Request Playground
            </Link>
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2 flex-1">
          <div className="flex gap-2">
            {account.isConnected && <NarCopyButton variant="secondary" label="Copy JWK" copy={JSON.stringify(jwk)} />}
            {connectors.map((connector) => (
              <NarButton
                label={account.isConnected ? formatAddress(account.address) : 'Connect Wallet'}
                variant={account.isConnected ? 'secondary' : 'primary'}
                leftIcon={<FontAwesomeIcon icon={account.isConnected ? faPowerOff : faWallet} />}
                key={connector.uid}
                onClick={() => (account.isConnected ? disconnect() : connect({ connector }))}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
