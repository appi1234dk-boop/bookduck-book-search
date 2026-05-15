'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Screen, NotionDatabase, BannerState } from '@/types'

interface UserStatus {
  connected: boolean
  selectedDatabaseId: string | null
}

export default function useWidget() {
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [loading, setLoading] = useState(true)
  const [databases, setDatabases] = useState<NotionDatabase[]>([])
  const [dbLoading, setDbLoading] = useState(false)
  const [banner, setBanner] = useState<BannerState | null>(null)

  // handleConnect is referenced by fetchDatabases' 401 banner; use a ref to break the cycle.
  const handleConnectRef = useRef<() => void>(() => {})

  const checkUser = useCallback(async (): Promise<UserStatus | null> => {
    try {
      const res = await fetch('/api/user', { credentials: 'include' })
      if (!res.ok) return null
      return (await res.json()) as UserStatus
    } catch {
      return null
    }
  }, [])

  const fetchDatabases = useCallback(async () => {
    setDbLoading(true)
    try {
      const res = await fetch('/api/notion/databases', { credentials: 'include' })
      if (res.status === 401) {
        setBanner({
          type: 'warning',
          message: '노션 연결이 만료됐어요',
          action: { label: '다시 연결', onClick: () => handleConnectRef.current() },
        })
        setScreen('onboarding')
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
  }, [])

  // Initialize
  useEffect(() => {
    async function init() {
      const data = await checkUser()
      if (!data || !data.connected) {
        setScreen('onboarding')
      } else if (!data.selectedDatabaseId) {
        setScreen('db-select')
        fetchDatabases()
      } else {
        setScreen('main')
      }
      setLoading(false)
    }
    init()
  }, [checkUser, fetchDatabases])

  const handleConnect = useCallback(async () => {
    let authUrl: string
    try {
      const res = await fetch('/api/notion/auth', {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to start auth')
      const data = await res.json()
      authUrl = data.authUrl
    } catch {
      setBanner({ type: 'error', message: '연결을 시작할 수 없어요. 다시 시도해주세요' })
      return
    }

    const popup = window.open(authUrl, 'notion-auth', 'width=500,height=700')

    const interval = setInterval(async () => {
      if (popup?.closed) {
        clearInterval(interval)
        const data = await checkUser()
        if (data?.connected) {
          if (data.selectedDatabaseId) {
            setScreen('main')
          } else {
            setScreen('db-select')
            fetchDatabases()
          }
        }
      }
    }, 500)

    setTimeout(() => clearInterval(interval), 300000)
  }, [checkUser, fetchDatabases])

  // Keep ref in sync so the 401 banner action calls the latest handler.
  useEffect(() => {
    handleConnectRef.current = handleConnect
  }, [handleConnect])

  const handleSelectDb = useCallback(async (databaseId: string) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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
