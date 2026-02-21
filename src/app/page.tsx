export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <main className="flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">SupaSocial Poster</h1>
          <p className="text-lg opacity-80">
            A super simple website to cross-post to all your social platforms at once.
          </p>
        </header>

        <section className="bg-card rounded-2xl p-8 border border-black/5 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Create New Post</h2>
          
          <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="content" className="font-medium text-sm">Post Content</label>
              <textarea 
                id="content"
                className="bg-background rounded-xl p-4 min-h-[120px] border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder="What do you want to share today? #hashtags"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm">Media</label>
              <div className="bg-background border-2 border-dashed border-black/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-black/5 transition-colors cursor-pointer">
                <span className="opacity-70">Click to upload image or video</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/5">
              <div className="flex items-center gap-4 text-sm font-medium opacity-80">
                <span>Posting to: X, LinkedIn, Instagram, Facebook, TikTok</span>
              </div>
              <button 
                type="button"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                Post Now
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
