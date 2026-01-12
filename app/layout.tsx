import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import Sidebar from '@/components/Sidebar'
import ChatButton from '@/components/ChatButton'
import { PreferencesProvider } from '@/components/PreferencesProvider'
import { SidebarProvider } from '@/components/SidebarProvider'
import DateFilterSync from '@/components/DateFilterSync'
import MainContent from '@/components/MainContent'

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
          <SidebarProvider>
            <DateFilterSync />
            <Sidebar />
            <MainContent>{children}</MainContent>
            <ChatButton />
          </SidebarProvider>
        </PreferencesProvider>
      </body>
    </html>
  )
}
