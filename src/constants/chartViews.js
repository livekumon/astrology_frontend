import { CHART_TAB_IDS } from './systems'

const VEDIC_SYSTEMS = new Set([
  'South Indian Vedic',
  'North Indian Vedic',
  'Vedic / Jyotish',
])

const WESTERN_SYSTEMS = new Set([
  'Western Tropical',
  'Sidereal Western',
  'Hellenistic',
])

/** Chart views available per tradition (only views with data in chartData). */
export function getChartViewsForSystem(systemId, chartData = null) {
  let views

  if (VEDIC_SYSTEMS.has(systemId)) {
    views = ['rasi', 'navamsa', 'dasamsa', 'transit', 'dasha']
  } else if (WESTERN_SYSTEMS.has(systemId)) {
    views = ['rasi', 'transit']
  } else {
    views = ['rasi', 'dasha']
  }

  if (!chartData) return views

  return views.filter((view) => {
    if (view === 'rasi') return Boolean(chartData.planets?.length)
    if (view === 'dasha') return Boolean(chartData.dashas?.length)
    return true
  })
}

export { CHART_TAB_IDS }
