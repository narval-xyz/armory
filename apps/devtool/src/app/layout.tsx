import { ReactNode } from 'react'
import MainLayout from './_components/MainLayout'
import './global.css'

export const metadata = {
  title: 'Narval Policy DevTool',
  description: 'Narval Policy DevTool'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
