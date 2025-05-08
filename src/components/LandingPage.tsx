import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { supabase } from "../lib/supabaseClient"

export const LandingPage: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // Check for an existing session on mount
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata.full_name || user.user_metadata.name || user.email)
      }
    }
    getUser()

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserName(session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email)
      } else {
        setUserName(null)
      }
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Top Nav */}
      <nav className="w-full flex items-center justify-between px-8 py-6 border-b bg-white/80 backdrop-blur z-10 animate-fade-in-down duration-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-primary">TalkPDF</span>
        </div>
        <div>
          <Button
            variant="ghost"
            size="lg"
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold shadow rounded-xl px-6 py-2 transition-all duration-200 border border-gray-200"
            onClick={handleLogin}
          >
            {userName ? `Welcome, ${userName}` : 'Login'}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full px-4 py-16 animate-fade-in-up duration-700">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight animate-fade-in-up duration-700 delay-100">
              <span className="inline-block animate-hero-pop">Instantly <span className="text-primary">Talk</span> to Any PDF</span><br />
              <span className="text-muted-foreground font-medium text-2xl block mt-2 animate-fade-in-up duration-700 delay-200">Your documents, now interactive.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in-up duration-700 delay-300">
              TalkPDF lets you upload any PDF and start a conversation with its contents. Ask questions, get summaries, and extract insights in seconds. No more endless scrolling or searching—just ask.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-5xl mx-auto px-4 py-16" id="features">
          <h2 className="text-3xl font-bold text-center mb-10 animate-fade-in-up duration-700 delay-200">Why TalkPDF?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border bg-white shadow text-center flex flex-col items-center animate-fade-in-up duration-700 delay-100 hover:shadow-xl transition-all">
              <span className="text-4xl mb-4">💬</span>
              <h3 className="text-xl font-semibold mb-2">Chat with Any Document</h3>
              <p className="text-gray-600">Ask questions and get instant answers from your PDFs. No more endless scrolling or searching.</p>
            </div>
            <div className="p-6 rounded-2xl border bg-white shadow text-center flex flex-col items-center animate-fade-in-up duration-700 delay-100 hover:shadow-xl transition-all">
              <span className="text-4xl mb-4">⚡</span>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast Insights</h3>
              <p className="text-gray-600">Summarize, extract, and understand key points in seconds using advanced AI.</p>
            </div>
            <div className="p-6 rounded-2xl border bg-white shadow text-center flex flex-col items-center animate-fade-in-up duration-700 delay-100 hover:shadow-xl transition-all">
              <span className="text-4xl mb-4">🔒</span>
              <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
              <p className="text-gray-600">Your documents never leave your device. All processing is local and secure.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-gray-400 py-6 text-sm bg-white border-t mt-8 animate-fade-in-up duration-700 delay-700 sticky bottom-0">
        &copy; {new Date().getFullYear()} TalkPDF. All rights reserved.
      </footer>
    </div>
  )
} 