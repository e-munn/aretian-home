import { AppSidebar } from '@/components/polls/sidebar/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <div className='flex flex-col min-h-screen w-full bg-background'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
