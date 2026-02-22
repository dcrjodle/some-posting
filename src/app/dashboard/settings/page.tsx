import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { savePlatformKeys } from './actions'

const PLATFORMS = [
  { 
    id: 'x', 
    name: 'X (Twitter)',
    description: 'Post updates to your X timeline.',
    instructions: [
      'Go to the X Developer Portal and create a Project & App.',
      'Set Up User Authentication (OAuth 2.0).',
      'Change App permissions to "Read & Write" and set a Callback URI.',
      'Generate your OAuth 2.0 User Access Token and Refresh Token.'
    ],
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text' },
      { name: 'clientSecret', label: 'Client Secret', type: 'password' },
      { name: 'accessToken', label: 'User Access Token', type: 'password', required: true },
      { name: 'refreshToken', label: 'Refresh Token', type: 'password' },
    ]
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn',
    description: 'Share text and links to your professional network.',
    instructions: [
      'Create an App on the LinkedIn Developer Portal.',
      'Request access to the "Share on LinkedIn" product.',
      'Verify your company page.',
      'Generate your Access Token using the OAuth 2.0 tools.'
    ],
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text' },
      { name: 'clientSecret', label: 'Client Secret', type: 'password' },
      { name: 'accessToken', label: 'User Access Token', type: 'password', required: true },
    ]
  },
  { 
    id: 'instagram', 
    name: 'Instagram',
    description: 'Publish photos and reels directly to your IG feed.',
    instructions: [
      'Link your Instagram Business Account to a Facebook Page.',
      'Create a Facebook Developer App and add "Instagram API".',
      'Generate a User Access Token in the Graph API Explorer.',
      'Extend it to a Long-Lived Access Token.'
    ],
    fields: [
      { name: 'accessToken', label: 'Facebook User Access Token', type: 'password', required: true },
    ]
  },
  { 
    id: 'facebook', 
    name: 'Facebook',
    description: 'Publish posts to your Facebook Page feed.',
    instructions: [
      'Ensure you have a Facebook Page where you are an Admin.',
      'Create a Facebook Developer App.',
      'Use the Graph API Explorer to generate a Page Access Token with "pages_manage_posts" scope.'
    ],
    fields: [
      { name: 'accessToken', label: 'Page Access Token', type: 'password', required: true },
    ]
  },
  { 
    id: 'tiktok', 
    name: 'TikTok',
    description: 'Directly upload videos to your TikTok account.',
    instructions: [
      'Create an App on the TikTok for Developers portal.',
      'Apply for the "Content Posting API".',
      'Implement OAuth to get your Access & Refresh tokens for the "video.publish" scope.'
    ],
    fields: [
      { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { name: 'refreshToken', label: 'Refresh Token', type: 'password' },
    ]
  },
  { 
    id: 'reddit', 
    name: 'Reddit',
    description: 'Submit links or text posts to subreddits.',
    instructions: [
      'Go to reddit.com/prefs/apps and click "create another app...".',
      'Select "script" or "web app" and fill in the details.',
      'Note your Client ID (under the app name) and Client Secret.',
      'Generate an OAuth access token and refresh token.'
    ],
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { name: 'subreddit', label: 'Default Subreddit', type: 'text', required: true },
    ]
  },
  { 
    id: 'youtube', 
    name: 'YouTube',
    description: 'Upload video content directly to your channel.',
    instructions: [
      'Create a project in the Google Cloud Console.',
      'Enable the "YouTube Data API v3".',
      'Set up OAuth 2.0 Credentials (Client ID & Secret).',
      'Generate a User Access Token with the "youtube.upload" scope.'
    ],
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { name: 'refreshToken', label: 'Refresh Token', type: 'password' },
    ]
  },
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
                <form action={savePlatformKeys} key={platform.id} className="flex flex-col gap-4 border-b border-black/5 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-base flex items-center gap-2">
                        {platform.name}
                        {isSaved && <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded border border-green-200">Connected</span>}
                      </h3>
                      <p className="text-xs opacity-60 mt-1 mb-3">{platform.description}</p>
                      <div className="bg-black/5 rounded-lg p-3 text-xs opacity-80 mb-2">
                        <strong className="block mb-1">Setup Instructions:</strong>
                        <ol className="list-decimal pl-4 space-y-1">
                          {platform.instructions.map((inst, i) => (
                            <li key={i}>{inst}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <input type="hidden" name="platform" value={platform.id} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {platform.fields.map(field => (
                        <div key={field.name} className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium opacity-80">{field.label}</label>
                          <input
                            name={field.name}
                            type={field.type}
                            required={field.required}
                            className="bg-background rounded-xl p-3 border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm w-full"
                            placeholder={`${isSaved ? 'Update' : 'Enter'} ${field.label}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-2">
                      <button type="submit" className="bg-black/5 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-black/10 transition-colors">
                        Save {platform.name} Credentials
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
