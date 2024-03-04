'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import EditorComponent from './EditorComponent'
import { config } from './config'

const queryClient = new QueryClient()

const Home = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <EditorComponent />
    </QueryClientProvider>
  </WagmiProvider>
)

export default Home
