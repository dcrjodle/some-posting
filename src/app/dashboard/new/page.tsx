import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createPost } from './actions'

const PLATFORMS = [
  { id: 'x', name: 'X (Twitter)' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'reddit', name: 'Reddit' },
  { id: 'youtube', name: 'YouTube' },
]

export default async function NewPostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch plan and usage
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan || 'free'
  const isPro = plan === 'pro'
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  const { count: postsThisMonth } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth)

  const overLimit = !isPro && (postsThisMonth || 0) >= 1

  // Fetch connected platforms to know which checkboxes can be enabled
  const { data: keys } = await supabase
    .from('platform_keys')
    .select('platform')
    .eq('user_id', user.id)

  const savedPlatforms = new Set(keys?.map(k => k.platform) || [])

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Post</h1>
        <p className="opacity-80 flex gap-2 text-sm max-w-xl">
          Upload media, add your caption, and blast it to all your connected platforms at once.
        </p>
      </header>
      
      {overLimit ? (
        <div className="bg-red-50 text-red-700 p-8 rounded-2xl border border-red-100 flex flex-col items-center text-center gap-4">
          <span className="text-4xl">🔒</span>
          <div>
            <h2 className="text-xl font-bold mb-1">Monthly Limit Reached</h2>
            <p className="max-w-md opacity-80">You've reached your limit of 1 post this month on the free plan. Upgrade to pro for unlimited posting.</p>
          </div>
          <Link href="/dashboard/settings" className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors mt-2">
            Upgrade Plan
          </Link>
        </div>
      ) : (
        <form action={createPost} className="bg-card rounded-2xl border border-black/5 p-8 shadow-sm flex flex-col gap-8">
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Description</label>
            <textarea
              name="content"
              required
              className="bg-background rounded-xl p-4 min-h-[140px] border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y text-sm"
              placeholder="What's happening?"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Hashtags</label>
            <input
              name="hashtags"
              type="text"
              className="bg-background rounded-xl p-3 border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              placeholder="#marketing #buildinpublic (space separated)"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Media Upload</label>
            <div className="bg-background border-2 border-dashed border-black/10 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-black/5 transition-colors cursor-pointer">
              <input type="file" name="media" className="hidden" id="media-upload" accept="image/*,video/*" />
              <label htmlFor="media-upload" className="flex flex-col items-center cursor-pointer w-full h-full">
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl opacity-60">📷</span>
                </div>
                <p className="font-medium">Click to upload image or video</p>
                <p className="text-sm opacity-50 mt-1 max-w-xs">Supports JPG, PNG, MP4 up to 50MB</p>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-black/5 flex flex-col gap-4">
            <label className="font-semibold text-sm mb-1">Select Platforms</label>
            {savedPlatforms.size === 0 ? (
               <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm border border-yellow-100 flex items-center justify-between">
                 <span>You haven't connected any platforms yet.</span>
                 <Link href="/dashboard/settings" className="font-semibold underline">Connect in Settings</Link>
               </div>
            ) : (
              <div className="flex gap-4 flex-wrap mb-4">
                {PLATFORMS.map(platform => {
                  const isEnabled = savedPlatforms.has(platform.id)
                  return (
                    <label 
                      key={platform.id} 
                      className={`flex items-center gap-2 border px-4 py-2 rounded-full transition-colors ${
                        isEnabled 
                          ? 'bg-background border-black/10 cursor-pointer hover:bg-black/5' 
                          : 'bg-black/5 border-transparent opacity-50 cursor-not-allowed'
                      }`}
                      title={isEnabled ? '' : 'Connect this platform in settings first'}
                    >
                      <input 
                        type="checkbox" 
                        name={`platform_${platform.id}`}
                        className="accent-primary w-4 h-4 cursor-pointer disabled:cursor-not-allowed" 
                        defaultChecked={isEnabled}
                        disabled={!isEnabled}
                      />
                      <span className="text-sm font-medium">{platform.name}</span>
                    </label>
                  )
                })}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <Link href="/dashboard" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={savedPlatforms.size === 0}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publish Post
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
