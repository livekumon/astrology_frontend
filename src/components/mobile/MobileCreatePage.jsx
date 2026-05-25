import BirthForm from '../BirthForm'
import { useLanguage } from '../../hooks/useLanguage'

export default function MobileCreatePage({
  selectedSystem,
  onSystemChange,
  birthDetails,
  onBirthDetailsChange,
  onGenerate,
  generating,
  error,
}) {
  const { t } = useLanguage()

  return (
    <div className="mobile-create-page">
      <div className="mobile-create-intro">
        <p className="mobile-create-eyebrow">{t('heroEyebrow')}</p>
        <h2 className="mobile-create-title">
          {t('heroTitle')} <em>{t('heroHighlight')}</em>
        </h2>
        <p className="mobile-create-sub">{t('heroSub')}</p>
      </div>

      <BirthForm
        selectedSystem={selectedSystem}
        onSystemChange={onSystemChange}
        birthDetails={birthDetails}
        onBirthDetailsChange={onBirthDetailsChange}
        onGenerate={onGenerate}
        generating={generating}
        error={error}
        mobile
      />
    </div>
  )
}
