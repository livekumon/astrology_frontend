import { useEffect, useRef, useState } from 'react'
import { LANGUAGES } from '../constants/systems'
import { getChartViewsForSystem } from '../constants/chartViews'
import { useLanguage } from '../hooks/useLanguage'

export default function MainHeader({
  onMenuClick,
  sidebarOpen,
  chartCast,
  chartData,
  activeChartView,
  onChartViewClick,
  onNewChart,
}) {
  const { language, setLanguage, t, ts, copy } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)
  const selectorRef = useRef(null)
  const activeLanguage = LANGUAGES.find((lang) => lang.code === language) || LANGUAGES[0]

  const chartViews = chartData ? getChartViewsForSystem(chartData.system, chartData) : []

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className={`main-header${chartCast ? ' main-header-chart-mode' : ''}`}>
      <nav className="main-header-top">
        <div className="main-header-brand">
          <button
            className="nav-menu-btn"
            onClick={onMenuClick}
            aria-label={t('toggleSidebar')}
            aria-expanded={sidebarOpen}
          >
            ☰
          </button>
          <div>
            <div className="logo-nav">✦ JYOTISH</div>
            <div className="logo-tagline">{t('tagline')}</div>
          </div>
        </div>

        <div className="main-header-actions">
          <div ref={selectorRef} className={`lang-selector ${langOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="lang-trigger"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              onClick={() => setLangOpen((prev) => !prev)}
            >
              <div className="lang-dot" />
              <span>{activeLanguage.nativeLabel}</span>
              <span className={`lang-chevron ${langOpen ? 'open' : ''}`}>▾</span>
            </button>
            <div className="lang-dropdown" role="listbox">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  role="option"
                  aria-selected={language === lang.code}
                  className={`lang-opt ${language === lang.code ? 'active' : ''}`}
                  onClick={() => { setLanguage(lang.code); setLangOpen(false) }}
                >
                  {lang.icon} {lang.nativeLabel}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {chartCast && chartData && (
        <>
          <div className="main-header-config">
            <div className="main-header-config-primary">
              <span className="main-header-tradition">{chartData.system}</span>
              <span className="main-header-sep">·</span>
              <span className="main-header-meta">{chartData.dateOfBirth}</span>
              <span className="main-header-sep">·</span>
              <span className="main-header-meta">{chartData.timeOfBirth}</span>
              <span className="main-header-sep">·</span>
              <span className="main-header-meta main-header-place">{chartData.placeOfBirth}</span>
            </div>

            <div className="main-header-insights">
              <span className="header-insight-pill">
                <span className="header-insight-icon">☀</span>
                {ts(chartData.sunSign)}
              </span>
              <span className="header-insight-pill">
                <span className="header-insight-icon">☽</span>
                {ts(chartData.moonSign)}
              </span>
              <span className="header-insight-pill">
                <span className="header-insight-icon">↑</span>
                {ts(chartData.ascSign)}
              </span>
            </div>

            <button type="button" className="main-header-new-chart" onClick={onNewChart}>
              ✦ {t('newChart')}
            </button>
          </div>

          {chartViews.length > 0 && (
            <div className="main-header-charts">
              <span className="main-header-charts-label">{t('chartsSection')}</span>
              <div className="main-header-chart-links">
                {chartViews.map((viewId) => (
                  <button
                    key={viewId}
                    type="button"
                    className={`main-header-chart-link${activeChartView === viewId ? ' active' : ''}`}
                    onClick={() => onChartViewClick(viewId)}
                  >
                    {copy.chartTabs[viewId]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </header>
  )
}
