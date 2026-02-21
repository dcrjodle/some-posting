import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { savePlatformKeys } from './actions'

const PLATFORMS = [
  { id: 'x', name: 'X (Twitter)' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'tiktok', name: 'TikTok' },
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan || 'free'
  const isPro = plan === 'pro'

  // Fetch existing keys to show status
  const { data: keys } = await supabase
    .from('platform_keys')
    .select('platform, updated_at')
    .eq('user_id', user.id)

  const savedPlatforms = new Set(keys?.map(k => k.platform) || [])

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <header className="mb-8 items-end justify-between flex">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="opacity-80">Manage your subscription and API keys.</p>
        </div>
      </header>
      
      <div className="flex flex-col gap-10">
        <section className="bg-card rounded-2xl border border-black/5 p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Subscription Plan</h2>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-medium text-lg capitalize">{plan} Plan</p>
              <p className="text-sm opacity-60 max-w-sm">
                {isPro 
                  ? "You have unlimited posts." 
                  : "You are currently on the free plan, limited to 1 post per month."}
              </p>
            </div>
            {!isPro && (
              <form action="/api/checkout" method="POST">
                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]">
                  Upgrade to Unlimited ($9/mo)
                </button>
              </form>
            )}
            {isPro && (
              <form action="/api/portal" method="POST">
                <button className="bg-background border border-black/10 px-6 py-2.5 rounded-lg font-semibold hover:bg-black/5 transition-colors active:scale-[0.98]">
                  Manage Subscription
                </button>
              </form>
            )}
          </div>
          <div className="bg-background rounded-xl p-4 border border-black/5 text-sm flex gap-2">
            <span className="opacity-70">Secured via Stripe</span>
            <span className="opacity-20">•</span>
            <span className="font-medium opacity-80">Cancel anytime</span>
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-black/5 p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Social Media API Keys</h2>
            <p className="text-sm opacity-60 max-w-md">Connect your social platforms to enable cross-posting. Keys are encrypted before being saved.</p>
          </div>
          
          <div className="flex flex-col gap-6">
            {PLATFORMS.map(platform => {
              const isSaved = savedPlatforms.has(platform.id)
              
              return (
                <form action={savePlatformKeys} key={platform.id} className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-center gap-4 border-b border-black/5 pb-6 last:border-0 last:pb-0">
                  <label className="font-semibold text-sm flex items-center gap-2">
                    {platform.name}
                    {isSaved && <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded border border-green-200">Connected</span>}
                  </label>
                  <div className="flex flex-col gap-2">
                    <input type="hidden" name="platform" value={platform.id} />
                    <div className="flex gap-4">
                      <input
                        name="accessToken"
                        type="password"
                        required
                        className="flex-1 bg-background rounded-xl p-3 border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                        placeholder={`${isSaved ? 'Update' : 'Enter'} Access Token`}
                      />
                      <input
                        name="secretToken"
                        type="password"
                        className="flex-1 bg-background rounded-xl p-3 border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                        placeholder={`${isSaved ? 'Update' : 'Enter'} Secret (Optional)`}
                      />
                      <button type="submit" className="bg-black/5 px-6 rounded-xl font-semibold text-sm hover:bg-black/10 transition-colors">
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
