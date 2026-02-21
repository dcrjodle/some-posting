import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile for plan info
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan || 'free'
  const isPro = plan === 'pro'
  const maxPosts = isPro ? Infinity : 1

  // Fetch recent posts
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  const { data: posts, count: postsThisMonth } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth)
    .order('created_at', { ascending: false })

  const postsRemaining = isPro ? Infinity : Math.max(0, maxPosts - (postsThisMonth || 0))
  const usagePercentage = isPro ? 0 : Math.min(100, ((postsThisMonth || 0) / maxPosts) * 100)

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="opacity-80">View your past posts and limits.</p>
        </div>
        <Link 
          href={postsRemaining > 0 ? "/dashboard/new" : "/dashboard/settings?upgrade=true"}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-opacity active:scale-[0.98] ${
            postsRemaining > 0 
              ? "bg-primary text-primary-foreground hover:opacity-90" 
              : "bg-black/10 text-foreground cursor-not-allowed"
          }`}
        >
          {postsRemaining > 0 ? "Create Post" : "Upgrade to Post More"}
        </Link>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card p-6 rounded-2xl border border-black/5 shadow-sm">
          <h3 className="text-sm font-semibold opacity-60 mb-2 uppercase tracking-wider">Plan</h3>
          <p className="text-2xl font-bold capitalize">
            {plan}
          </p>
          {!isPro && (
            <Link href="/dashboard/settings?upgrade=true" className="inline-block mt-4 text-sm text-primary font-semibold hover:underline">
              Upgrade to Pro &rarr;
            </Link>
          )}
        </div>
        <div className="bg-card p-6 rounded-2xl border border-black/5 shadow-sm">
          <h3 className="text-sm font-semibold opacity-60 mb-2 uppercase tracking-wider">Posts this month</h3>
          <p className="text-2xl font-bold">{postsThisMonth || 0} / {isPro ? 'Unlimited' : maxPosts}</p>
          {!isPro && (
            <div className="w-full bg-black/5 h-2 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full border border-black/5 transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-6">Recent Posts</h2>
        <div className="bg-card rounded-2xl border border-black/5 shadow-sm divide-y divide-black/5">
          {!posts || posts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl opacity-50">📝</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">No posts yet</h3>
              <p className="text-sm opacity-60 mb-6 max-w-sm">
                You haven't published any posts using SupaSocial. Create your first cross-platform post now!
              </p>
              {postsRemaining > 0 && (
                <Link 
                  href="/dashboard/new"
                  className="bg-background border border-black/10 px-6 py-2 rounded-lg font-semibold hover:bg-black/5 transition-colors active:scale-[0.98]"
                >
                  Create First Post
                </Link>
              )}
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="p-6 flex flex-col gap-4">
                <p className="text-sm">{post.content}</p>
                <div className="flex gap-2 text-xs opacity-60">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Posted to: {post.platforms_posted_to?.join(', ')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
