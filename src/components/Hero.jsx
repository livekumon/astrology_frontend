import { useLanguage } from '../i18n/LanguageContext'

export default function Hero({ compact = false }) {
  const { t } = useLanguage()

  return (
    <div className={`hero${compact ? ' hero-compact' : ''}`}>
      <div className="hero-eyebrow">{t('heroEyebrow')}</div>
      <h1>
        {t('heroTitle')}
        {!compact && (
          <>
            <br />
            <em>{t('heroHighlight')}</em>
          </>
        )}
        {compact && <> <em>{t('heroHighlight')}</em></>}
      </h1>
      <p className="hero-sub">{t('heroSub')}</p>
      <div className="mandala-wrap">
        <div className="mandala-ring" />
        <div className="mandala-ring" />
        <div className="mandala-ring" />
        <div className="mandala-center" />
      </div>
    </div>
  )
}
