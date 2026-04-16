'use client'

import useWidget from '@/hooks/useWidget'
import OnboardingScreen from '@/components/features/OnboardingScreen'
import DbSelectScreen from '@/components/features/DbSelectScreen'
import MainScreen from '@/components/features/MainScreen'

export default function WidgetPage() {
  const {
    screen, userId, loading, databases, dbLoading, banner,
    handleConnect, handleSelectDb, handleChangeDb, handleReconnect, dismissBanner,
  } = useWidget()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <svg className="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle opacity="0.25" cx="12" cy="12" r="10" stroke="#2383E2" strokeWidth="3" />
          <path opacity="0.75" fill="#2383E2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', minHeight: 300, maxHeight: 600 }}>
      {screen === 'onboarding' && <OnboardingScreen onConnect={handleConnect} />}
      {screen === 'db-select' && <DbSelectScreen databases={databases} loading={dbLoading} onSelect={handleSelectDb} />}
      {screen === 'main' && (
        <MainScreen
          userId={userId} banner={banner} onBannerDismiss={dismissBanner}
          onReconnect={handleReconnect} onChangeDb={handleChangeDb}
        />
      )}
    </div>
  )
}
