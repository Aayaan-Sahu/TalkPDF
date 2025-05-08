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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-6xl font-bold tracking-tight text-foreground">
            Welcome to Our Platform{userName ? `, ${userName}` : ""}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Experience the future of digital innovation. Our platform brings together cutting-edge technology and seamless user experience.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card text-card-foreground">
            <h3 className="text-2xl font-semibold mb-4">Innovative Solutions</h3>
            <p className="text-muted-foreground">
              Discover cutting-edge features designed to enhance your experience.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-card-foreground">
            <h3 className="text-2xl font-semibold mb-4">Seamless Integration</h3>
            <p className="text-muted-foreground">
              Connect with your favorite tools and services effortlessly.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-card-foreground">
            <h3 className="text-2xl font-semibold mb-4">24/7 Support</h3>
            <p className="text-muted-foreground">
              Our dedicated team is always here to help you succeed.
            </p>
          </div>
        </div>

        {/* Login Button */}
        <div className="mt-20 text-center">
          <Button variant="secondary" size="lg" onClick={handleLogin}>
            Login to Your Account
          </Button>
        </div>
      </div>
    </div>
  )
} 