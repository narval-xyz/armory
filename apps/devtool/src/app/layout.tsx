import './global.css'

export const metadata = {
  title: 'Welcome to Narval Policy DevTool',
  description: 'Narval Policy DevTool'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
