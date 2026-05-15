'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Screen, NotionDatabase, BannerState } from '@/types'
import { setStoredUserId, widgetHeaders } from '@/lib/clientSession'

interface UserStatus {
  connected: boolean
  selectedDatabaseId: string | null
  userId?: string
}

export default function useWidget() {
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [loading, setLoading] = useState(true)
  const [databases, setDatabases] = useState<NotionDatabase[]>([])
  const [dbLoading, setDbLoading] = useState(false)
  const [banner, setBanner] = useState<BannerState | null>(null)
  // Pre-fetched so the connect-click can call window.open() synchronously inside the
  // gesture handler. An await between the click and window.open is silently blocked by
  // Safari (and increasingly by Chrome) in cross-site iframes — even the about:blank
  // pre-open trick fails on some Safari versions. Pre-fetching sidesteps the issue.
  const [authUrl, setAuthUrl] = useState<string | null>(null)

  // handleConnect is referenced by fetchDatabases' 401 banner; use a ref to break the cycle.
  const handleConnectRef = useRef<() => void>(() => {})

  const rememberUserId = useCallback((id: string | undefined | null) => {
    if (id) setStoredUserId(id)
  }, [])

  const checkUser = useCallback(async (): Promise<UserStatus | null> => {
    try {
      const res = await fetch('/api/user', {
        credentials: 'include',
        headers: widgetHeaders(),
      })
      if (!res.ok) return null
      const data = (await res.json()) as UserStatus
      rememberUserId(data.userId)
      return data
    } catch {
      return null
    }
  }, [rememberUserId])

  const prefetchAuthUrl = useCallback(async () => {
    try {
      const res = await fetch('/api/notion/auth', {
        method: 'POST',
        credentials: 'include',
        headers: widgetHeaders(),
      })
      if (!res.ok) return
      const data = await res.json()
      rememberUserId(data?.userId)
      if (data?.authUrl) setAuthUrl(data.authUrl)
    } catch {
      // Silent: the connect button will show an error banner if user clicks before this resolves.
    }
  }, [rememberUserId])

  const fetchDatabases = useCallback(async () => {
    setDbLoading(true)
    try {
      const res = await fetch('/api/notion/databases', {
        credentials: 'include',
        headers: widgetHeaders(),
      })
      if (res.status === 401) {
        setBanner({
          type: 'warning',
          message: '노션 연결이 만료됐어요',
          action: { label: '다시 연결', onClick: () => handleConnectRef.current() },
        })
        setScreen('onboarding')
        prefetchAuthUrl()
        return
      }
      if (!res.ok) throw new Error('Failed to fetch databases')
      const data = await res.json()
      setDatabases(data.databases)
    } catch {
      setBanner({ type: 'error', message: '데이터베이스 목록을 불러올 수 없어요' })
    } finally {
      setDbLoading(false)
    }
  }, [prefetchAuthUrl])

  const applyUserStatus = useCallback((data: UserStatus | null) => {
    if (!data || !data.connected) return false
    if (data.selectedDatabaseId) {
      setScreen('main')
    } else {
      setScreen('db-select')
      fetchDatabases()
    }
    return true
  }, [fetchDatabases])

  // Initialize. widgetHeaders() reads localStorage on demand, so the very first request
  // already carries the stored id (if any) as a header fallback to the cookie path.
  useEffect(() => {
    async function init() {
      const data = await checkUser()
      if (!applyUserStatus(data)) {
        setScreen('onboarding')
        prefetchAuthUrl()
      }
      setLoading(false)
    }
    init()
  }, [checkUser, applyUserStatus, prefetchAuthUrl])

  // Re-check when the iframe regains visibility/focus.
  // Mobile Notion app opens OAuth in Safari (separate app), so the popup-close polling
  // we run in handleConnect never observes anything — when the user switches back to
  // Notion, the iframe needs another signal to know auth completed. visibilitychange +
  // focus cover the common return paths (app switch, tab switch, popup close on desktop).
  useEffect(() => {
    if (screen !== 'onboarding') return
    async function recheck() {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      const data = await checkUser()
      applyUserStatus(data)
    }
    document.addEventListener('visibilitychange', recheck)
    window.addEventListener('focus', recheck)
    return () => {
      document.removeEventListener('visibilitychange', recheck)
      window.removeEventListener('focus', recheck)
    }
  }, [screen, checkUser, applyUserStatus])

  const handleConnect = useCallback(() => {
    if (!authUrl) {
      setBanner({
        type: 'error',
        message: '연결 준비 중이에요. 잠시 후 다시 시도해주세요',
      })
      prefetchAuthUrl()
      return
    }

    // Synchronous: window.open is called directly from the click handler with the
    // final URL, so the user-gesture credit reaches it intact.
    const popup = window.open(authUrl, 'notion-auth', 'width=500,height=700')
    if (!popup) {
      setBanner({
        type: 'error',
        message: '팝업이 차단됐어요. 브라우저에서 팝업을 허용한 후 다시 시도해주세요',
      })
      return
    }

    const interval = setInterval(async () => {
      if (popup.closed) {
        clearInterval(interval)
        const data = await checkUser()
        if (!applyUserStatus(data)) {
          // OAuth failed or cancelled — refresh the URL so a retry doesn't reuse a stale state.
          prefetchAuthUrl()
        }
      }
    }, 500)

    setTimeout(() => clearInterval(interval), 300000)
  }, [authUrl, checkUser, applyUserStatus, prefetchAuthUrl])

  // Keep ref in sync so the 401 banner action calls the latest handler.
  useEffect(() => {
    handleConnectRef.current = handleConnect
  }, [handleConnect])

  const handleSelectDb = useCallback(async (databaseId: string) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        credentials: 'include',
        headers: widgetHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ selectedDatabaseId: databaseId }),
      })
      if (!res.ok) throw new Error('Failed to select database')
      setScreen('main')
    } catch {
      setBanner({
        type: 'error',
        message: '데이터베이스 선택에 실패했어요. 다시 시도해주세요',
      })
    }
  }, [])

  const handleChangeDb = useCallback(() => {
    setScreen('db-select')
    fetchDatabases()
  }, [fetchDatabases])

  const handleReconnect = useCallback(() => {
    setBanner({
      type: 'warning',
      message: '노션 연결이 만료됐어요',
      action: { label: '다시 연결', onClick: handleConnect },
    })
  }, [handleConnect])

  const dismissBanner = useCallback(() => {
    setBanner(null)
  }, [])

  return {
    screen,
    loading,
    databases,
    dbLoading,
    banner,
    handleConnect,
    handleSelectDb,
    handleChangeDb,
    handleReconnect,
    dismissBanner,
  }
}
