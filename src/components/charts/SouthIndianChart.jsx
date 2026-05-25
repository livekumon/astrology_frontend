import { useLanguage } from '../../hooks/useLanguage'
import {
  formatPlanetCodes,
  normalizePlanetCodes,
} from '../../i18n/chartLocale'

const LAYOUT = [
  [2, 1, 1, 3],
  [10, null, null, 4],
  [9, null, null, 5],
  [8, 7, 7, 6],
]

export default function SouthIndianChart({ planets = [] }) {
  const { t, copy } = useLanguage()
  const houseData = {}

  planets.forEach((planet) => {
    const codes = normalizePlanetCodes(planet)
    const label = formatPlanetCodes(codes, copy)
    if (!label) return

    if (houseData[planet.house]) {
      houseData[planet.house] += `\n${label}`
    } else {
      houseData[planet.house] = label
    }
  })

  const cells = []

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const houseNum = LAYOUT[r][c]

      if ((r === 1 || r === 2) && (c === 1 || c === 2)) {
        if (r === 1 && c === 1) {
          cells.push(
            <div key={`${r}-${c}`} className="si-cell center">
              <div className="si-center-symbol">◈</div>
              <div>{t('natal')}</div>
              <div className="si-center-sub">{t('southIndian')}</div>
            </div>,
          )
        }
        continue
      }

      cells.push(
        <div key={`${r}-${c}`} className="si-cell">
          <span className="si-house-num">{houseNum}</span>
          {houseData[houseNum - 1] && <span className="planet">{houseData[houseNum - 1]}</span>}
        </div>,
      )
    }
  }

  return (
    <>
      <div className="si-chart">{cells}</div>
      <div className="chart-legend" style={{ whiteSpace: 'pre-line' }}>
        {t('chartLegend')}
      </div>
    </>
  )
}
