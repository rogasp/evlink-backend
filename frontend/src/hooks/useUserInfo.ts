'use client'

import { useSupabase } from '@/lib/supabaseContext'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation' // För redirect efter logout (valfritt)

export function useUserInfo() {
  const { supabase } = useSupabase()
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>()
  const [userName, setUserName] = useState<string | undefined>()
  const [userEmail, setUserEmail] = useState<string | undefined>()
  const [isAdmin, setIsAdmin] = useState(false)

  const updateUserFromSession = useCallback(async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('[🔴 useUserInfo] Supabase error:', error)
      return
    }

    const user = session?.user
    if (user) {
      setIsLoggedIn(true)
      setAvatarUrl(user.user_metadata?.avatar_url)
      setUserName(user.user_metadata?.name || user.email)
      setUserEmail(user.email)
      setIsAdmin(user.user_metadata?.role === 'admin')
    } else {
      setIsLoggedIn(false)
      setAvatarUrl(undefined)
      setUserName(undefined)
      setUserEmail(undefined)
      setIsAdmin(false)
    }
  }, [supabase])

  useEffect(() => {
    updateUserFromSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      updateUserFromSession()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, updateUserFromSession])

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[🔴 Logout error]', error.message)
    } else {
      console.log('[✅ Logout successful]')
      router.push('/login') 
    }
  }

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : ''

  return {
    isLoggedIn,
    avatarUrl,
    userName,
    userEmail,
    initials,
    isAdmin,
    logout, 
  }
}
