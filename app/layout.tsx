import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import Sidebar from '@/components/Sidebar'
import ChatButton from '@/components/ChatButton'
import { PreferencesProvider } from '@/components/PreferencesProvider'

export const metadata: Metadata = {
  title: 'StryDash - Activity Dashboard',
  description: 'Activity dashboard for visualizing your Stryd data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900">
        <PreferencesProvider>
          <Sidebar />
          <main className="pt-16 lg:pt-0 lg:ml-64 transition-all duration-300">
            {children}
          </main>
          <ChatButton />
        </PreferencesProvider>
      </body>
    </html>
  )
}
