import { useEffect, useState } from "react"
import { supabase } from "./lib/supabaseClient"
import { LandingPage } from "./components/LandingPage"
import ProductPage from "./components/ProductPage"
import PaymentPage from "./components/PaymentPage"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChatWithPdf from './components/ChatWithPdf';

const PROFILES_TABLE = 'profiles'

const App: React.FC = () => {
  const [authState, setAuthState] = useState<'loading' | 'signedOut' | 'paying' | 'nonpaying'>('loading')

  useEffect(() => {
    const checkUserAndSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAuthState('signedOut')
        return
      }
      // Check if user exists in profiles table
      const { data: profile, error: profileError } = await supabase
        .from(PROFILES_TABLE)
        .select('id')
        .eq('email', user.email)
        .single()
      if (profileError && profileError.code === 'PGRST116') { // No rows found
        // Insert new profile with inactive subscription
        await supabase.from(PROFILES_TABLE).insert({
          id: user.id,
          email: user.email,
          subscription_status: 'inactive',
          stripe_customer_id: null,
          subscription_id: null,
          price_id: null,
        })
      }
      // Fetch subscription_status from profiles table
      const { data, error } = await supabase
        .from(PROFILES_TABLE)
        .select('subscription_status')
        .eq('email', user.email)
        .single()
      if (error || !data) {
        setAuthState('nonpaying')
        return
      }
      setAuthState(data.subscription_status === 'active' ? 'paying' : 'nonpaying')
    }
    checkUserAndSubscription()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setAuthState('signedOut')
        return
      }
      // Re-check subscription status on auth change
      checkUserAndSubscription()
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (authState === 'loading') return null
  if (authState === 'signedOut') return <LandingPage />
  if (authState === 'nonpaying') return <PaymentPage />
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/chat" element={<ChatWithPdf />} />
        <Route path="/success" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App 