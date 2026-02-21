import { login, signup } from './actions'

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error === 'true';
  const message = searchParams?.message as string;

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <main className="w-full max-w-sm flex flex-col gap-6">
        <header className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">SupaSocial</h1>
          <p className="opacity-80">Log in or sign up to continue</p>
        </header>

        <section className="bg-card rounded-2xl p-6 border border-black/5 shadow-sm">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium text-center">
              {message || "An error occurred"}
            </div>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-medium text-sm">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="bg-background rounded-lg p-3 border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="you@email.com"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="font-medium text-sm">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="bg-background rounded-lg p-3 border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                formAction={login}
                className="bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] w-full"
              >
                Log in
              </button>
              <button
                formAction={signup}
                className="bg-transparent border-2 border-primary text-primary px-4 py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors active:scale-[0.98] w-full"
              >
                Sign up
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
