import { useLanguage } from '../../hooks/useLanguage'

const TAB_TITLE_KEYS = {
  home: 'navHome',
  chat: 'navChat',
  charts: 'navCharts',
  history: 'navHistory',
  account: 'navAccount',
}

export default function MobileHeader({ activeTab, chartCast, chartData }) {
  const { t, ts } = useLanguage()
  const titleKey = TAB_TITLE_KEYS[activeTab] || 'tagline'

  return (
    <header className="mobile-header">
      <div className="mobile-header-top">
        <div className="mobile-header-brand">
          <span className="mobile-header-logo" aria-hidden="true">✦</span>
          <div>
            <h1 className="mobile-header-title">{t(titleKey)}</h1>
            <p className="mobile-header-subtitle">{t('tagline')}</p>
          </div>
        </div>
      </div>

      {chartCast && chartData && activeTab === 'chat' && (
        <div className="mobile-header-chart-bar">
          <span className="mobile-header-tradition">{chartData.system}</span>
          <div className="mobile-header-pills">
            <span className="mobile-pill">☀ {ts(chartData.sunSign)}</span>
            <span className="mobile-pill">☽ {ts(chartData.moonSign)}</span>
            <span className="mobile-pill">↑ {ts(chartData.ascSign)}</span>
          </div>
        </div>
      )}
    </header>
  )
}
