'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import NarButton from '../design-system/NarButton'

const NavBar = () => {
  const account = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div className="flex px-10 py-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src="/narval-wordmark-white.png" width="150" height="50" alt="Narval Logo" priority />
        </Link>
        <div className="flex gap-8 ml-10 text-nv-lg">
          <Link href="/policy-engine">Policy Engine</Link>
          <Link href="/data-store">Data Store</Link>
          <Link href="/transaction-request">Transaction Request</Link>
          <Link href="/vault">Vault</Link>
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
  )
}

export default NavBar
