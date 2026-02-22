import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SupaSocial Poster - Post Everywhere All At Once',
  description: 'The ultimate single-pane-of-glass dashboard. Upload once, and seamlessly dispatch your content to X, LinkedIn, Instagram, Facebook, TikTok, Reddit, and YouTube.',
  keywords: ['social media scheduling', 'cross posting', 'twitter', 'linkedin', 'instagram', 'facebook', 'tiktok', 'reddit', 'youtube'],
  openGraph: {
    title: 'SupaSocial Poster',
    description: 'Post everywhere. All at once. Seamlessly dispatch content to 7 major platforms.',
    type: 'website',
  }
}

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FCFCFC] text-[#0A0A0A] pt-32 md:pt-0">
      
      {/* Animated Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          SupaSocial Poster is now live
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          Post <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">everywhere.</span><br />
          All at once.
        </h1>
        
        <p className="text-xl md:text-2xl opacity-70 mb-12 max-w-2xl font-medium leading-relaxed">
          The ultimate single-pane-of-glass dashboard. Upload once, and seamlessly dispatch your content to X, LinkedIn, Instagram, Facebook, TikTok, Reddit, and YouTube.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-[#0A0A0A] text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
          >
            Get Started <span className="text-xl">→</span>
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-white text-[#0A0A0A] border border-black/10 rounded-2xl font-bold text-lg hover:bg-black/5 transition-colors active:scale-95 flex items-center justify-center"
          >
            Log In
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-20 flex flex-wrap justify-center gap-4 opacity-60">
          {['X (Twitter)', 'LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'Reddit', 'YouTube'].map(platform => (
            <div key={platform} className="px-4 py-2 rounded-full border border-black/20 text-sm font-semibold">
              {platform}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
