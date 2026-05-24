import { useLanguage } from '../../i18n/LanguageContext'
import { getPlanetName } from '../../i18n/chartLocale'

export default function DashaTimeline({ dashas = [] }) {
  const { t, copy } = useLanguage()

  return (
    <div className="dasha-wrap">
      <div className="dasha-title">{t('dashaTitle')}</div>
      <div className="dasha-list">
        {dashas.map((dasha, i) => (
          <div
            key={`${dasha.planet}-${dasha.startIso || i}`}
            className={`dasha-row${dasha.isCurrent ? ' current' : ''}${dasha.isPast ? ' past' : ''}`}
          >
            <div className="dasha-header">
              <span className={dasha.isCurrent ? 'current' : ''}>
                {getPlanetName(dasha.planet, copy)} {dasha.isCurrent ? t('dashaCurrent') : ''}
              </span>
              <span>{dasha.period}</span>
            </div>
            <div className="dasha-bar">
              <div
                className="dasha-fill"
                style={{ width: `${dasha.progress}%`, background: dasha.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
