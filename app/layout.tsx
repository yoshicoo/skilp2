import './globals.css'
import React from 'react'

export const metadata = { title: 'SKILP', description: 'スキル可視化Webアプリ' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="border-b border-slate-800/60">
          <div className="container flex items-center justify-between h-16">
            <div className="text-xl font-semibold tracking-wide">SKILP</div>
            <div className="text-sm text-slate-400">SHIFT | スキル可視化</div>
          </div>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="container py-10 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} SKILP
        </footer>
      </body>
    </html>
  )
}
