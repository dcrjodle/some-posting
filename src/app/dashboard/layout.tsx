import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-black/5 flex flex-col p-6 gap-8 bg-card fixed h-full overflow-y-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          SupaSocial
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          <Link href="/dashboard" className="px-4 py-2.5 rounded-lg hover:bg-black/5 transition-colors font-medium text-sm">
            Overview
          </Link>
          <Link href="/dashboard/new" className="px-4 py-2.5 rounded-lg hover:bg-black/5 transition-colors font-medium text-sm">
            New Post
          </Link>
          <Link href="/dashboard/settings" className="px-4 py-2.5 rounded-lg hover:bg-black/5 transition-colors font-medium text-sm">
            Settings
          </Link>
        </nav>

        <div className="text-sm opacity-60 truncate">
          {user.email}
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
