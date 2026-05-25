import { useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import SouthIndianChart from './charts/SouthIndianChart'
import WheelChart from './charts/WheelChart'
import DashaTimeline from './charts/DashaTimeline'

function formatDivisionSubtitle(base, division, ts) {
  if (!division?.ascSign) return base
  return `${base} · ↑ ${ts(division.ascSign)} · ☉ ${ts(division.sunSign)} · ☽ ${ts(division.moonSign)}`
}

function formatTransitSubtitle(base, transit, ts, t) {
  if (!transit) return base
  const parts = [base]
  if (transit.referenceDate) {
    parts.push(`${t('transitAsOf') || 'As of'} ${transit.referenceDate}`)
  }
  if (transit.summary) {
    parts.push(transit.summary)
  }
  return parts.join(' · ')
}

function ChartDisplay({ activeTab, chartData, copy, ts, t }) {
  if (!chartData) return null
  switch (activeTab) {
    case 'rasi':
      return <SouthIndianChart planets={chartData.planets} />
    case 'navamsa':
      return (
        <WheelChart
          title={copy.wheelCharts.navamsaTitle}
          subtitle={formatDivisionSubtitle(copy.wheelCharts.navamsaSub, chartData.navamsa, ts)}
          wheelPlanets={chartData.navamsa?.wheelPlanets}
        />
      )
    case 'dasamsa':
      return (
        <WheelChart
          title={copy.wheelCharts.dasamsaTitle}
          subtitle={formatDivisionSubtitle(copy.wheelCharts.dasamsaSub, chartData.dasamsa, ts)}
          wheelPlanets={chartData.dasamsa?.wheelPlanets}
        />
      )
    case 'transit':
      return (
        <WheelChart
          title={copy.wheelCharts.transitTitle}
          subtitle={formatTransitSubtitle(copy.wheelCharts.transitSub, chartData.transit, ts, t)}
          wheelPlanets={chartData.transit?.wheelPlanets}
        />
      )
    case 'dasha':
      return <DashaTimeline dashas={chartData.dashas} />
    default:
      return null
  }
}

export default function ChartModal({ open, tabId, chartData, onClose }) {
  const { copy, t, ts } = useLanguage()

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
          <ChartDisplay activeTab={tabId} chartData={chartData} copy={copy} ts={ts} t={t} />
        </div>
      </div>
    </div>
  )
}
