import { getChartViewsForSystem } from '../../constants/chartViews'
import { useLanguage } from '../../i18n/LanguageContext'

export default function MobileChartsPage({ chartData, onChartViewClick }) {
  const { t, ts, copy } = useLanguage()

  if (!chartData) {
    return (
      <div className="mobile-page mobile-charts-page">
        <p className="mobile-empty-state">{t('mobileChartsEmpty')}</p>
      </div>
    )
  }

  const chartViews = getChartViewsForSystem(chartData.system, chartData)

  return (
    <div className="mobile-page mobile-charts-page">
      <div className="mobile-page-intro">
        <h2>{t('chartsSection')}</h2>
        <p>{t('mobileChartsHint')}</p>
      </div>

      <div className="mobile-reading-summary">
        <div className="mobile-summary-row">
          <span className="mobile-summary-label">{chartData.system}</span>
          <span className="mobile-summary-meta">{chartData.dateOfBirth}</span>
        </div>
        <div className="mobile-summary-pills">
          <span className="mobile-pill">☀ {ts(chartData.sunSign)}</span>
          <span className="mobile-pill">☽ {ts(chartData.moonSign)}</span>
          <span className="mobile-pill">↑ {ts(chartData.ascSign)}</span>
        </div>
        <p className="mobile-summary-place">{chartData.placeOfBirth}</p>
      </div>

      <div className="mobile-chart-grid">
        {chartViews.map((viewId) => (
          <button
            key={viewId}
            type="button"
            className="mobile-chart-card"
            onClick={() => onChartViewClick(viewId)}
          >
            <span className="mobile-chart-card-icon">◈</span>
            <span className="mobile-chart-card-label">{copy.chartTabs[viewId]}</span>
            <span className="mobile-chart-card-action">{t('mobileOpenChart')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
