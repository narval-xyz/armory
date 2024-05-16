'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { config } from '../_lib/config'
import NavBar from './NavBar'

const MainLayout = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient()

  return (
    <div className="h-screen w-screen">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <NavBar />
          <div className="h-full w-full px-[80px] pt-[110px] pb-[36px]">{children}</div>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}

export default MainLayout
