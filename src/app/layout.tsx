import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Theme Creator Studio - Windows Desktop Theme Designer',
  description: 'Design, configure, preview, validate, and package custom Windows desktop themes into standalone portable installers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090b0e] text-slate-100 antialiased selection:bg-storm-600 selection:text-white">
        {children}
      </body>
    </html>
  )
}
