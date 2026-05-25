import { useState } from 'react'
import { CHART_TAB_IDS } from '../constants/systems'
import { useLanguage } from '../hooks/useLanguage'
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

export default function ChartsSection({ chartData, activeTab, onTabChange, sectionRef }) {
  const { copy, t, ts } = useLanguage()
  const [expanded, setExpanded] = useState(false)

  if (!chartData) return null

  return (
    <div
      className={`charts-section visible charts-collapsible ${expanded ? 'charts-expanded' : 'charts-collapsed'}`}
      ref={sectionRef}
    >
      <div
        className="charts-header-row"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
      >
        <div className="charts-header-left">
          <span className="charts-toggle-icon">{expanded ? '▾' : '▸'}</span>
          <span className="charts-header-title">{t('chartsSection')}</span>
        </div>
        <div className="insights-strip-inline">
          <div className="insight-pill">
            <span className="insight-pill-icon">☀</span>
            <span className="insight-pill-label">{t('sunSign')}</span>
            <span className="insight-pill-value">{ts(chartData.sunSign)}</span>
          </div>
          <div className="insight-pill">
            <span className="insight-pill-icon">☽</span>
            <span className="insight-pill-label">{t('moonSign')}</span>
            <span className="insight-pill-value">{ts(chartData.moonSign)}</span>
          </div>
          <div className="insight-pill">
            <span className="insight-pill-icon">↑</span>
            <span className="insight-pill-label">{t('ascendant')}</span>
            <span className="insight-pill-value">{ts(chartData.ascSign)}</span>
          </div>
        </div>
        <span className="charts-expand-hint">{expanded ? t('collapseCharts') : t('expandCharts')}</span>
      </div>

      <div className="charts-body">
        <div className="charts-body-inner">
          <div className="chart-tabs">
            {CHART_TAB_IDS.map((tabId) => (
              <div
                key={tabId}
                className={`chart-tab ${activeTab === tabId ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onTabChange(tabId)
                }}
              >
                {copy.chartTabs[tabId]}
              </div>
            ))}
          </div>
          <div className="chart-display">
            <ChartDisplay activeTab={activeTab} chartData={chartData} copy={copy} />
          </div>
        </div>
      </div>
    </div>
  )
}
