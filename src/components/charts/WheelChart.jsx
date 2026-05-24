import { useLanguage } from '../../i18n/LanguageContext'
import { getWheelPlanetSymbols, getWheelSignLabels } from '../../i18n/chartLocale'

const CX = 100
const CY = 100
const WEDGE_RADIUS = 88
const SIGN_RADIUS = 79
const PLANET_RADIUS = 51
const INNER_RING_RADIUS = 40

// Planets sit in their own wedge slot, offset from sign labels (slot 0.5).
const PLANET_PLACEMENTS = [
  { segment: 1, slot: 0.28 },
  { segment: 6, slot: 0.72 },
  { segment: 9, slot: 0.28 },
  { segment: 4, slot: 0.72 },
  { segment: 11, slot: 0.28 },
]

function polarToXY(segment, slot, radius) {
  const angle = ((segment + slot) / 12) * Math.PI * 2 - Math.PI / 2
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
  }
}

export default function WheelChart({ title, subtitle }) {
  const { t, copy } = useLanguage()
  const signLabels = getWheelSignLabels(copy)
  const planets = getWheelPlanetSymbols(copy)
  const useNativeScript = signLabels.some((label) => /[^\u0000-\u007F♈-♓]/.test(label))

  return (
    <div className="wheel-chart-wrap">
      <div className="wheel-title">{title}</div>
      <div className="wheel-sub">{subtitle}</div>
      <svg className="wheel-chart-svg" viewBox="0 0 200 200" aria-hidden="true">
        {signLabels.map((sign, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2
          const a2 = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2
          const x1 = CX + WEDGE_RADIUS * Math.cos(a)
          const y1 = CY + WEDGE_RADIUS * Math.sin(a)
          const x2 = CX + WEDGE_RADIUS * Math.cos(a2)
          const y2 = CY + WEDGE_RADIUS * Math.sin(a2)
          const { x: tx, y: ty } = polarToXY(i, 0.5, SIGN_RADIUS)

          return (
            <g key={`${sign}-${i}`}>
              <path
                d={`M${CX},${CY} L${x1},${y1} A${WEDGE_RADIUS},${WEDGE_RADIUS},0,0,1,${x2},${y2}Z`}
                fill={i % 2 === 0 ? 'rgba(200,132,74,0.08)' : 'rgba(200,132,74,0.04)'}
                stroke="rgba(200,132,74,0.25)"
                strokeWidth="0.5"
              />
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={useNativeScript ? '11' : '13'}
                fill="rgba(196,184,168,0.85)"
                fontFamily={useNativeScript ? "'Raleway', sans-serif" : undefined}
                className="wheel-sign-label"
              >
                {sign}
              </text>
            </g>
          )
        })}

        <circle
          cx={CX}
          cy={CY}
          r={INNER_RING_RADIUS}
          fill="rgba(200,132,74,0.04)"
          stroke="rgba(200,132,74,0.28)"
          strokeWidth="0.75"
        />

        {planets.map((planet, index) => {
          const placement = PLANET_PLACEMENTS[index]
          const { x: px, y: py } = polarToXY(placement.segment, placement.slot, PLANET_RADIUS)

          return (
            <text
              key={planet.code}
              x={px}
              y={py}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={useNativeScript ? '13' : '14'}
              fill="#f0c896"
              fontWeight="700"
              fontFamily="'Raleway', sans-serif"
              className="wheel-planet-label"
            >
              {planet.label}
            </text>
          )
        })}

        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={useNativeScript ? '10' : '9'}
          fill="rgba(232,184,138,0.85)"
          letterSpacing="0.5"
          fontFamily="'Raleway', sans-serif"
        >
          {t('wheelCenter')}
        </text>
      </svg>
    </div>
  )
}
