'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '../lib/config'
import CodeEditor from './CodeEditor'

const queryClient = new QueryClient()

const Home = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <CodeEditor />
    </QueryClientProvider>
  </WagmiProvider>
)

export default Home
