'use client'

import { useState, useEffect, useCallback } from 'react'
import { WIDGET_USER_ID_KEY } from '@/constants'
import type { Screen, NotionDatabase, BannerState } from '@/types'

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(WIDGET_USER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(WIDGET_USER_ID_KEY, id)
  }
  return id
}

export default function useWidget() {
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [databases, setDatabases] = useState<NotionDatabase[]>([])
  const [dbLoading, setDbLoading] = useState(false)
  const [banner, setBanner] = useState<BannerState | null>(null)

  // Initialize: check user status
  useEffect(() => {
    const id = getOrCreateUserId()
    setUserId(id)

    async function checkUser() {
      try {
        const res = await fetch('/api/user', {
          headers: { 'x-widget-user-id': id },
        })
        if (!res.ok) {
          setScreen('onboarding')
          setLoading(false)
          return
        }

        const data = await res.json()
        if (!data.connected) {
          setScreen('onboarding')
        } else if (!data.selectedDatabaseId) {
          setScreen('db-select')
          fetchDatabases(id)
        } else {
          setScreen('main')
        }
      } catch {
        setScreen('onboarding')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const fetchDatabases = useCallback(async (uid: string) => {
    setDbLoading(true)
    try {
      const res = await fetch('/api/notion/databases', {
        headers: { 'x-widget-user-id': uid },
      })

      if (res.status === 401) {
        setBanner({
          type: 'warning',
          message: '노션 연결이 만료됐어요',
          action: { label: '다시 연결', onClick: () => handleConnect() },
        })
        setScreen('onboarding')
        return
      }

      if (!res.ok) throw new Error('Failed to fetch databases')
      const data = await res.json()
      setDatabases(data.databases)
    } catch {
      setBanner({
        type: 'error',
        message: '데이터베이스 목록을 불러올 수 없어요',
      })
    } finally {
      setDbLoading(false)
    }
  }, [])

  const handleConnect = useCallback(() => {
    const authUrl = `/api/notion/auth?userId=${userId}`
    const popup = window.open(authUrl, 'notion-auth', 'width=500,height=700')

    // Poll for OAuth completion
    const interval = setInterval(async () => {
      if (popup?.closed) {
        clearInterval(interval)
        // Check if connection was successful
        try {
          const res = await fetch('/api/user', {
            headers: { 'x-widget-user-id': userId },
          })
          const data = await res.json()
          if (data.connected) {
            if (data.selectedDatabaseId) {
              setScreen('main')
            } else {
              setScreen('db-select')
              fetchDatabases(userId)
            }
          }
        } catch {
          // Stay on current screen
        }
      }
    }, 500)

    // Clean up after 5 minutes max
    setTimeout(() => clearInterval(interval), 300000)
  }, [userId, fetchDatabases])

  const handleSelectDb = useCallback(async (databaseId: string) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-widget-user-id': userId,
        },
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
  }, [userId])

  const handleChangeDb = useCallback(() => {
    setScreen('db-select')
    fetchDatabases(userId)
  }, [userId, fetchDatabases])

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
    userId,
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
