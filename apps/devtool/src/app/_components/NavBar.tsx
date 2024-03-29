'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import NarButton from '../_design-system/NarButton'

const NavBar = () => {
  const currentPath = usePathname()
  const account = useAccount()
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
            <Link href="/policy-engine" className={`${currentPath === '/policy-engine' ? 'underline' : ''}`}>
              Policy Engine
            </Link>
            <Link href="/data-store" className={`${currentPath === '/data-store' ? 'underline' : ''}`}>
              Data Store
            </Link>
            <Link
              href="/transaction-request"
              className={`${currentPath === '/transaction-request' ? 'underline' : ''}`}
            >
              Transaction Request
            </Link>
            <Link href="/vault" className={`${currentPath === '/vault' ? 'underline' : ''}`}>
              Vault
            </Link>
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2 flex-1">
          {!account.isConnected && (
            <div className="flex gap-2">
              {connectors.map((connector) => (
                <NarButton
                  label=" Connect Wallet"
                  variant="primary"
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                />
              ))}
            </div>
          )}
          {account.isConnected && <NarButton label="Disconnect" variant="secondary" onClick={() => disconnect()} />}
        </div>
      </div>
    </nav>
  )
}

export default NavBar
