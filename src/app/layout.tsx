import './globals.css'
import { Inter } from 'next/font/google'

import Web3Provider from "./Web3Provider";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lucky Buttons',
  description: 'Feeling lucky today?',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
