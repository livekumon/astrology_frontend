import { useEffect, useRef, useState } from 'react'
import { useSidebarState } from './hooks/useSidebarState'
import { generateChart } from './api/client'
import { useLanguage } from './i18n/LanguageContext'
import { useAuth } from './contexts/AuthContext'
import { useConversations } from './contexts/ConversationContext'
import Starfield from './components/Starfield'
import BackgroundEffects from './components/BackgroundEffects'
import MainHeader from './components/MainHeader'
import Hero from './components/Hero'
import BirthForm from './components/BirthForm'
import MobileCreatePage from './components/mobile/MobileCreatePage'
import ChatSection from './components/ChatSection'
import ChartModal from './components/ChartModal'
import Sidebar from './components/Sidebar'
import MobileHeader from './components/mobile/MobileHeader'
import MobileBottomNav from './components/mobile/MobileBottomNav'
import MobileHistoryPage from './components/mobile/MobileHistoryPage'
import MobileProfilePage from './components/mobile/MobileProfilePage'
import MobileChartsPage from './components/mobile/MobileChartsPage'

export default function App() {
  const { language, t } = useLanguage()
  const { user } = useAuth()
  const { activeConversation, createConversation } = useConversations()

  const [selectedSystem, setSelectedSystem] = useState('South Indian Vedic')
  const [birthDetails, setBirthDetails] = useState({
    dateOfBirth: '1984-12-05',
    timeOfBirth: '02:11',
    placeOfBirth: 'Eluru, Andhra Pradesh, India',
    gender: '',
  })
  const [chartData, setChartData] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const { open: sidebarOpen, toggle: toggleSidebar, close: closeSidebar, isDesktop } = useSidebarState()
  const [activeChartView, setActiveChartView] = useState(null)
  const [mobileTab, setMobileTab] = useState('home')
  const chatRef = useRef(null)

  const chartCast = !!chartData
  const isMobile = !isDesktop

  useEffect(() => {
    if (!isMobile) return
    if (!chartCast && (mobileTab === 'chat' || mobileTab === 'charts')) {
      setMobileTab('home')
    }
    if (chartCast && mobileTab === 'home') {
      setMobileTab('chat')
    }
  }, [chartCast, isMobile, mobileTab])

  function handleBirthDetailsChange(updates) {
    setBirthDetails((prev) => ({ ...prev, ...updates }))
  }

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const data = await generateChart({
        system: selectedSystem,
        language,
        ...birthDetails,
      })
      const chart = { ...data, language }
      setChartData(chart)
      setActiveChartView(null)

      if (user) {
        const name = `${birthDetails.placeOfBirth || 'Reading'} – ${new Date().toLocaleDateString()}`
        await createConversation(chart, language, name)
      }

      if (isMobile) setMobileTab('chat')
    } catch (err) {
      setError(err.message || t('chartError'))
    } finally {
      setGenerating(false)
    }
  }

  function handleEditChart() {
    setChartData(null)
    setActiveChartView(null)
    setError('')
    if (isMobile) setMobileTab('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSelectConversation(conv) {
    if (conv.chartData) {
      setChartData({ ...conv.chartData, language: conv.language || language })
      setActiveChartView(null)
    }
  }

  function handleSelectConversationMobile(conv) {
    handleSelectConversation(conv)
    if (isMobile) setMobileTab('chat')
  }

  function handleChartViewClick(viewId) {
    setActiveChartView((current) => (current === viewId ? null : viewId))
  }

  function renderDesktopContent() {
    return (
      <>
        <MainHeader
          onMenuClick={toggleSidebar}
          sidebarOpen={sidebarOpen}
          chartCast={chartCast}
          chartData={chartData}
          activeChartView={activeChartView}
          onChartViewClick={handleChartViewClick}
          onNewChart={handleEditChart}
        />

        {!chartCast ? (
          <div className="create-workspace">
            <div className="create-layout">
              <Hero compact />
              <BirthForm
                selectedSystem={selectedSystem}
                onSystemChange={setSelectedSystem}
                birthDetails={birthDetails}
                onBirthDetailsChange={handleBirthDetailsChange}
                onGenerate={handleGenerate}
                generating={generating}
                error={error}
              />
            </div>
          </div>
        ) : (
          <div className="chat-workspace" ref={chatRef}>
            <ChatSection
              chartData={chartData}
              visible
              fullHeight
              conversation={activeConversation}
            />
          </div>
        )}
      </>
    )
  }

  function renderMobileContent() {
    return (
      <>
        <MobileHeader activeTab={mobileTab} chartCast={chartCast} chartData={chartData} />

        <div className="mobile-main">
          {mobileTab === 'home' && !chartCast && (
            <MobileCreatePage
              selectedSystem={selectedSystem}
              onSystemChange={setSelectedSystem}
              birthDetails={birthDetails}
              onBirthDetailsChange={handleBirthDetailsChange}
              onGenerate={handleGenerate}
              generating={generating}
              error={error}
            />
          )}

          {mobileTab === 'chat' && chartCast && (
            <div className="mobile-chat-workspace" ref={chatRef}>
              <ChatSection
                chartData={chartData}
                visible
                fullHeight
                conversation={activeConversation}
              />
            </div>
          )}

          {mobileTab === 'charts' && chartCast && (
            <MobileChartsPage
              chartData={chartData}
              onChartViewClick={handleChartViewClick}
            />
          )}

          {mobileTab === 'history' && (
            <MobileHistoryPage
              onSelectConversation={handleSelectConversationMobile}
              onNavigateChat={() => setMobileTab('chat')}
            />
          )}

          {mobileTab === 'account' && (
            <MobileProfilePage chartCast={chartCast} onNewChart={handleEditChart} />
          )}
        </div>

        <MobileBottomNav
          chartCast={chartCast}
          activeTab={mobileTab}
          onChange={setMobileTab}
          t={t}
        />
      </>
    )
  }

  return (
    <div
      className={[
        'app-shell',
        chartCast ? 'app-shell-locked' : 'app-shell-create',
        isMobile ? 'app-shell-mobile' : '',
      ].filter(Boolean).join(' ')}
    >
      {isDesktop && (
        <Sidebar
          open={sidebarOpen}
          isDesktop={isDesktop}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          onSelectConversation={handleSelectConversation}
          onNewChart={handleEditChart}
        />
      )}

      <div className={`main-content${chartCast ? ' chart-mode' : ' create-mode'}${isMobile ? ' main-content-mobile' : ''}`}>
        <Starfield />
        <BackgroundEffects />

        {isDesktop ? renderDesktopContent() : renderMobileContent()}
      </div>

      <ChartModal
        open={Boolean(activeChartView)}
        tabId={activeChartView}
        chartData={chartData}
        onClose={() => setActiveChartView(null)}
      />
    </div>
  )
}
