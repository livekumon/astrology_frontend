import { ASTROLOGY_SYSTEMS } from '../constants/systems'
import { useLanguage } from '../i18n/LanguageContext'
import GenderField from './GenderField'

export default function BirthForm({
  selectedSystem,
  onSystemChange,
  birthDetails,
  onBirthDetailsChange,
  onGenerate,
  generating,
  error,
  mobile = false,
}) {
  const { copy, t } = useLanguage()

  if (mobile) {
    return (
      <div className="birth-form-mobile">
        <section className="birth-form-mobile-section">
          <div className="birth-form-mobile-header">
            <span className="step-badge">1</span>
            <h3 className="card-title">{t('chooseTradition')}</h3>
          </div>
          <div className="birth-form-tradition-grid">
            {ASTROLOGY_SYSTEMS.map((system) => (
              <button
                key={system.id}
                type="button"
                className={`sys-btn ${selectedSystem === system.id ? 'active' : ''}`}
                onClick={() => onSystemChange(system.id)}
              >
                <span className="sys-icon">{system.icon}</span>
                <span className="sys-label">{copy.systems[system.labelKey]}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="birth-form-mobile-section">
          <div className="birth-form-mobile-header">
            <span className="step-badge">2</span>
            <h3 className="card-title">{t('birthDetails')}</h3>
          </div>

          <div className="birth-form-fields">
            <div className="input-group">
              <label className="input-label" htmlFor="mobile-dob">
                {t('dateOfBirth')}
              </label>
              <input
                id="mobile-dob"
                type="date"
                className="cosmic-input"
                value={birthDetails.dateOfBirth}
                onChange={(e) => onBirthDetailsChange({ dateOfBirth: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="mobile-tob">
                {t('timeOfBirth')}
              </label>
              <input
                id="mobile-tob"
                type="time"
                className="cosmic-input"
                value={birthDetails.timeOfBirth}
                onChange={(e) => onBirthDetailsChange({ timeOfBirth: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="mobile-pob">
                {t('placeOfBirth')}
              </label>
              <input
                id="mobile-pob"
                type="text"
                className="cosmic-input"
                placeholder={t('placePlaceholder')}
                value={birthDetails.placeOfBirth}
                onChange={(e) => onBirthDetailsChange({ placeOfBirth: e.target.value })}
              />
            </div>
            <GenderField
              idPrefix="mobile-"
              value={birthDetails.gender || ''}
              onChange={(gender) => onBirthDetailsChange({ gender })}
              t={t}
            />
          </div>

          {error && <div className="error-banner birth-form-mobile-error">{error}</div>}
        </section>

        <div className="birth-form-mobile-actions">
          <button
            type="button"
            className="cta-btn birth-form-mobile-cta"
            onClick={onGenerate}
            disabled={generating}
          >
            {t('castChart')}
          </button>
          <div className={`generating ${generating ? 'show' : ''}`}>
            <div className="gen-dot" />
            <div className="gen-dot" />
            <div className="gen-dot" />
            <span>{t('readingCosmos')}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-form-panel">
      <div className="glass-card create-form-card">
        <div className="create-form-body">
          <section className="create-form-section create-form-tradition">
            <div className="create-section-header">
              <div className="step-badge">I</div>
              <div className="card-title">{t('chooseTradition')}</div>
            </div>

            <div className="create-system-grid">
              {ASTROLOGY_SYSTEMS.map((system) => (
                <button
                  key={system.id}
                  type="button"
                  className={`sys-btn ${selectedSystem === system.id ? 'active' : ''}`}
                  onClick={() => onSystemChange(system.id)}
                >
                  <span className="sys-icon">{system.icon}</span>
                  {copy.systems[system.labelKey]}
                </button>
              ))}
            </div>
          </section>

          <section className="create-form-section create-form-birth">
            <div className="create-section-header">
              <div className="step-badge">II</div>
              <div className="card-title">{t('birthDetails')}</div>
            </div>

            <div className="create-input-grid">
              <div className="create-input-row">
                <div className="input-group">
                  <label className="input-label" htmlFor="dob">
                    {t('dateOfBirth')}
                  </label>
                  <input
                    id="dob"
                    type="date"
                    className="cosmic-input"
                    value={birthDetails.dateOfBirth}
                    onChange={(e) => onBirthDetailsChange({ dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="tob">
                    {t('timeOfBirth')}
                  </label>
                  <input
                    id="tob"
                    type="time"
                    className="cosmic-input"
                    value={birthDetails.timeOfBirth}
                    onChange={(e) => onBirthDetailsChange({ timeOfBirth: e.target.value })}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="pob">
                  {t('placeOfBirth')}
                </label>
                <input
                  id="pob"
                  type="text"
                  className="cosmic-input"
                  placeholder={t('placePlaceholder')}
                  value={birthDetails.placeOfBirth}
                  onChange={(e) => onBirthDetailsChange({ placeOfBirth: e.target.value })}
                />
              </div>
              <GenderField
                compact
                value={birthDetails.gender || ''}
                onChange={(gender) => onBirthDetailsChange({ gender })}
                t={t}
              />
            </div>

            {error && <div className="error-banner create-error">{error}</div>}

            <div className="cta-wrap create-cta">
              <button
                type="button"
                className="cta-btn"
                onClick={onGenerate}
                disabled={generating}
              >
                {t('castChart')}
              </button>
              <div className={`generating ${generating ? 'show' : ''}`}>
                <div className="gen-dot" />
                <div className="gen-dot" />
                <div className="gen-dot" />
                <span>{t('readingCosmos')}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
