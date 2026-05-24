import { useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import SouthIndianChart from './charts/SouthIndianChart'
import WheelChart from './charts/WheelChart'
import DashaTimeline from './charts/DashaTimeline'

function ChartDisplay({ activeTab, chartData, copy }) {
  if (!chartData) return null
  switch (activeTab) {
    case 'rasi':
      return <SouthIndianChart planets={chartData.planets} />
    case 'navamsa':
      return <WheelChart title={copy.wheelCharts.navamsaTitle} subtitle={copy.wheelCharts.navamsaSub} />
    case 'dasamsa':
      return <WheelChart title={copy.wheelCharts.dasamsaTitle} subtitle={copy.wheelCharts.dasamsaSub} />
    case 'transit':
      return <WheelChart title={copy.wheelCharts.transitTitle} subtitle={copy.wheelCharts.transitSub} />
    case 'dasha':
      return <DashaTimeline dashas={chartData.dashas} />
    default:
      return null
  }
}

export default function ChartModal({ open, tabId, chartData, onClose }) {
  const { copy, t } = useLanguage()

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !chartData || !tabId) return null

  const title = copy.chartTabs[tabId] || t('chartsSection')

  return (
    <div className="chart-modal-overlay" onClick={onClose} role="presentation">
      <div className="chart-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="chart-modal-header">
          <div>
            <div className="chart-modal-eyebrow">{chartData.system}</div>
            <h2 className="chart-modal-title">{title}</h2>
          </div>
          <button type="button" className="chart-modal-close" onClick={onClose} aria-label={t('detailModalClose')}>
            ×
          </button>
        </div>
        <div className="chart-modal-body">
          <ChartDisplay activeTab={tabId} chartData={chartData} copy={copy} />
        </div>
      </div>
    </div>
  )
}
